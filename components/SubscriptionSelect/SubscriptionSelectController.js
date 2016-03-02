({
    doInit : function(component, event, helper) {
       // Retrieve object list from the org
       helper.getObjectNames(component);
    },
    handleObjectChange : function(component, event, helper) {
        // Retrieve field list from the org
       helper.getFieldNames(component);
    },
    subscribe : function(component, event, helper) {
        // Create a streaming subscription
       helper.subscribe(component);
    },
    clear : function(component, event, helper) {
        // Clear the text area
       helper.clear(component);
    },
    togglePauseState : function(component, event, helper) {
        // Pause updates from appearing in the text area
       helper.togglePauseState(component);
    },
    handlePauseStatus : function(component, event, helper) {
        // Change pause button text accordingly
        var state = event.getParam("state");
        var elem = document.getElementById("btn-pause");
        if (state === "paused") {
            elem.innerHTML = "Resume";
        } else {
            elem.innerHTML = "Pause";
        }
    }
})
