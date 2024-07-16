const widgetContainer = document.getElementById("widget-container");
const maxWidgets = 50;
const activeUpgrades = {
    doubleReap: false,
    doubleNurseMachine: false
};

function getWidgetCount() {
    return widgetContainer.getElementsByClassName("widget").length;
}

function buy(store) {
    let bank = parseInt(score.innerHTML);
    let cost = parseInt(store.getAttribute("cost"));
    console.log(`bank: [${bank}] cost: [${cost}]`);
    
    if (bank < cost) {
        alert("Insufficient funds");
        return;
    }

    if (getWidgetCount() >= maxWidgets) {
        alert("Maximum number of items reached");
        return;
    }

    changeScore(-1 * cost);

    var widget = document.createElement("div");
    widget.classList.add("widget");
    fillWidget(store, widget);

    // Apply active upgrades to the new widget
    applyActiveUpgrades(widget);

    widget.onclick = () => {
        harvest(widget);
    };

    // Adds delete button to the widget
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = (e) => {
        e.stopPropagation();
        deleteWidget(widget);
    };
    widget.appendChild(deleteButton);

    widgetContainer.appendChild(widget);
    if (widget.getAttribute("auto") == 'true') harvest(widget);
}

function applyActiveUpgrades(widget) {
    if (activeUpgrades.doubleReap) {
        let reap = parseInt(widget.getAttribute("reap"));
        widget.setAttribute("reap", reap * 2);
    }

    if (activeUpgrades.doubleNurseMachine) {
        let name = widget.getAttribute("name");
        if (name === "Nurse" || name === "Hospital Machines") {
            let reap = parseInt(widget.getAttribute("reap"));
            widget.setAttribute("reap", reap * 2);
        }
    }
}

function buyUpgrade(upgrade) {
    let bank = parseInt(score.innerHTML);
    let cost = parseInt(upgrade.getAttribute("cost"));
    console.log(`bank: [${bank}] cost: [${cost}]`);
    
    if (bank < cost) {
        alert("Insufficient funds");
        return;
    }

    changeScore(-1 * cost);

    applyUpgrade(upgrade);
    upgrade.style.display = "none"; // Hide the upgrade after purchase
}

function applyUpgrade(upgrade) {
    let effect = upgrade.getAttribute("effect");

    if (effect === "double-reap") {
        activeUpgrades.doubleReap = true;
        let widgets = document.getElementsByClassName("widget");
        for (let widget of widgets) {
            let reap = parseInt(widget.getAttribute("reap"));
            widget.setAttribute("reap", reap * 2);
        }
    } else if (effect === "double-nurse-machine") {
        activeUpgrades.doubleNurseMachine = true;
        let widgets = document.getElementsByClassName("widget");
        for (let widget of widgets) {
            let name = widget.getAttribute("name");
            if (name === "Nurse" || name === "Hospital Machines") {
                let reap = parseInt(widget.getAttribute("reap"));
                widget.setAttribute("reap", reap * 2);
            }
        }
    }
}

function harvest(widget) {
    // Only run if currently not harvesting
    if (widget.hasAttribute("harvesting") || widget.dataset.deleted === "true") return;
    // Set harvesting flag
    widget.setAttribute("harvesting", "");

    // If manual, collect points now
    if (widget.getAttribute("auto") != 'true') {
        changeScore(widget.getAttribute("reap"));
        showPoint(widget);
    }

    const timeoutId = setTimeout(() => {
        // Remove the harvesting flag
        widget.removeAttribute("harvesting");
        // If automatic, collect points
        if (widget.dataset.deleted === "true") return;
        if (widget.getAttribute("auto") == 'true') {
            changeScore(widget.getAttribute("reap"));
            showPoint(widget);
            harvest(widget);
            //Play sound
        }
    }, parseFloat(widget.getAttribute("cooldown")) * 1000);

    widget.dataset.timeoutId = timeoutId; 
}

function changeScore(amount) {
    score.innerHTML = parseInt(score.innerHTML) + parseInt(amount);

    // Update the stores to block buying expensive boxes
    for (let store of stores) {
        let bank = parseInt(score.innerHTML);
        let cost = parseInt(store.getAttribute("cost"));

        if (bank < cost) {
            store.setAttribute("broke", "");
        } else {
            store.removeAttribute("broke");
        }
    }
}

function showPoint(widget) {
    let number = document.createElement("span");
    number.className = "point";
    number.innerHTML = "+" + widget.getAttribute("reap");
    number.style.left = "50%";
    number.style.top = "50%";
    number.onanimationend = () => {
        widget.removeChild(number);
    };
    widget.appendChild(number);
}

function deleteWidget(widget) {
    widget.dataset.deleted = "true";
    if (widget.dataset.timeoutId) {
        clearTimeout(widget.dataset.timeoutId);
    }
    widgetContainer.removeChild(widget);
}
