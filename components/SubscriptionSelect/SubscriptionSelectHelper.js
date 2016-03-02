({
    getObjectNames: function(component) {
        var action = component.get("c.getObjectNames");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var objMap = response.getReturnValue();
                var objectOptions = [];
                
                for (key in objMap){
                    var objectOption = new Object();
                    objectOption.label = key;
                    objectOption.value = objMap[key];
                    objectOptions.push(objectOption);
                }
                component.set("v.objectOptions", objectOptions);
            }
        });
        $A.enqueueAction(action);
    },
    getFieldNames: function(component) {
        var action = component.get("c.getObjectFields");
        var selected = component.find("objectSelect").get("v.value");

        // Set the parameter to the Apex controller as the value the
        // user selected on the object drop-down
        action.setParams({
            objName : selected
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var fldMap = response.getReturnValue();
                var fieldOptions = [];
                var ctr = 0;
                
                for (key in fldMap){
                    var fieldOption = new Object();
                    fieldOption.label = key;
                    fieldOption.value = fldMap[key];
                    fieldOptions.push(fieldOption);
                    ctr += 1;
                }
                component.set("v.fieldOptions", fieldOptions);
            }
        });
        $A.enqueueAction(action);
    },
    subscribe: function(component) {
        // Retrieve the value of the object select
        var selectedObject = component.find("objectSelect").get("v.value");

        // Retrieve the values of the field multi-select
        var options = component.find("fieldSelect").get("v.value");
        
        // Create the query string
        var queryStr = "SELECT " + options.replace(/;/g, ", ") + " FROM " + selectedObject;
        
        // call the subscribe method on the child
        var screamingChild = component.find("screamingChild");
        screamingChild.subscribe(queryStr);
    },
    clear: function(component) {
        var screamingChild = component.find("screamingChild");
        screamingChild.clear();
    },
    togglePauseState: function(component) {
        var screamingChild = component.find("screamingChild");
        screamingChild.togglePauseState();
    }
})
