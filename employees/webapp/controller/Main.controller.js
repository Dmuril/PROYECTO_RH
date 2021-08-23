sap.ui.define([
		"sap/ui/core/mvc/Controller"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller) {
		"use strict";

		return Controller.extend("project.employees.controller.Main", {
			onInit: function () {
               this._bus = sap.ui.getCore().getEventBus(); 
            },
            
            onNavToNewEmployee: function(){
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("NewEmployee");
            },


            onNavToEmployeesList: function(){
                this._bus.publish("flexible", "_filterData", '{}' );
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("EmployeesList");
            }
		});
	});
