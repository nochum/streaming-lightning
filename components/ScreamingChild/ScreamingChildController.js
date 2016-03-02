({
    doInit : function(component, event, helper) {
        
        // Retrieve the session id and initialize cometd
        var sessionAction = component.get("c.sessionId");
        sessionAction.setCallback(this, function(response) {
            var state = response.getState();
            if(state  === "SUCCESS") {
                var sessionId = response.getReturnValue();
                var authstring = "OAuth " + sessionId;
                
                //authenticate to the Streaming API
                $.cometd.init({
                    url: window.location.protocol + '//' + window.location.hostname + '/cometd/36.0/',
                    requestHeaders: { Authorization: authstring },
                    appendMessageTypeToURL : false
                });
            }
        });
        $A.enqueueAction(sessionAction);
        
        // Retrieve and store the user's id (to be used upon subscription)
        var userAction = component.get("c.userId");
        userAction.setCallback(this, function(response) {
            var state = response.getState();
            if(state  === "SUCCESS") {
                var userId = response.getReturnValue();
            	component.set("v.userId", userId);
            }
        });
        $A.enqueueAction(userAction);
    },
    subscribe : function(component, event, helper) {
		// This method receives a query string as an argument
        var params = event.getParam('arguments');

        if (params) {
            var queryStr = params.queryStr;
            var userId = component.get("v.userId");
            
            // upsert the push topic with the new query
            var action = component.get("c.upsertPushTopic");
            action.setParams({
                userId : userId,
                strQuery: queryStr
            });
            
			// If successful, create a cometd subscription            
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (component.isValid() && state === "SUCCESS") {
                    var disconnected = $.cometd.isDisconnected();
                    var personalTopic = '/topic/' + userId;
                    
                    var _subscription = $.cometd.subscribe(personalTopic, function(message) {
		                console.log('message: ' + JSON.stringify(message));
		                var elem = document.getElementById("streaming-text");
                        var currentEvents = elem.innerHTML;
                        var eventType = message.data.event.type;
                        var payloadMessage = "";
                        if (eventType === "created" || eventType === "updated") {
                            payloadMessage = JSON.stringify(message.data.sobject);
                        } else if (eventType === "deleted") {
                            payloadMessage = "Id: " + message.data.sobject.Id;
                        }
                        var eventDetail = "[" + new Date() + "]\t" + 
                            eventType + "\t" + 
                            payloadMessage + "\n";
                        console.log(payloadMessage);
                        // If we are in pause state, add the event to the pause buffer.  Else
                        // add the event to the text area for display.
                        var isPaused = component.get("v.isPaused");
                        if (isPaused === true) {
                            var pauseBuffer = component.get("v.pauseBuffer");
                            component.set("v.pauseBuffer", pauseBuffer + eventDetail );
                        } else {
                            elem.innerHTML = currentEvents + eventDetail;
                            
                            // This places the invisible cursor at the end of the
                            // read-only text area.  This causes the scrolling effect.
                            if (typeof elem.selectionStart === "number") {
                                elem.selectionStart = elem.selectionEnd = elem.value.length;
                            } else if (typeof elem.createTextRange !== "undefined") {
                                elem.focus();
                                var range = elem.createTextRange();
                                range.collapse(false);
                                range.select();
                            }
                        }
                    });
                }
            });
            $A.enqueueAction(action);
        }
    },
    clear : function(component, event, helper) {
        var elem = document.getElementById("streaming-text");
        elem.innerHTML = "";
    },
    togglePauseState : function(component, event, helper) {
        // Retrieve the current pause state
        var isPaused = component.get("v.isPaused");

        // If we are going from paused to unpaused, we need to
        // move the pauseBuffer to the text area, and clear the
        // pause buffer.
        if (isPaused === true) {
            var elem = document.getElementById("streaming-text");
            var currentEvents = elem.innerHTML;
            var pauseBuffer = component.get("v.pauseBuffer");

            elem.innerHTML = currentEvents + pauseBuffer;
            component.set("v.pauseBuffer", "" );
        }

        // toggle the pause state
		var newIsPaused = (isPaused === true ? false : true);
        component.set("v.isPaused",  newIsPaused );
        
        // Send an event to the parent indicating the current pause state
        var pauseStatusEvent = component.getEvent("pauseStatusEvent");
        pauseStatusEvent.setParams({"state" : (newIsPaused === true ? "paused" : "unpaused") });
        console.log("about to fire an event to my parent...");
        pauseStatusEvent.fire();
    }
})
