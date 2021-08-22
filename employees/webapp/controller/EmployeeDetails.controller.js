/* eslint-disable no-undef */
//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {

    return Controller.extend("project.employees.controller.EmployeeDetails", {
        onInit: function () {

            var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                isSelectedOne: false,
            });

            this.getView().setModel(oJSONModelConfig, "jsonModelConfig");
            
         },

        
    });

});