/* eslint-disable no-undef */
//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], function (Controller, Filter, FilterOperator, JSONModel, History) {

    return Controller.extend("project.employees.controller.EmployeesList", {

        onInit: function () {
            //Trabajar solo con los datos de mi SapId
            oView = this.getView();
             this.getOwnerComponent().getModel("employeeModel").read("/Users", {
             		filters: [
              			new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId)
              		],
              		success: function (oData) {
              			var employeeModelFilter = new JSONModel(oData);
                         oView.setModel(employeeModelFilter, "employeeModelFilter");
                         oView.getModel("employeeModelFilter").refresh();
              		}
            });

            var oJSONModelFilter = new sap.ui.model.json.JSONModel({
                valueToFilter: "",
            });

            this.getView().setModel(oJSONModelFilter, "jsonModelFilter");

        },

        //Mostrar el empleado seleccionado en la vista lateral derecha
        showEmployee: function (oEvent) {
            var oContext  = oEvent.getSource().getBindingContext("employeeModelFilter");
            var objectContext = oContext.getObject();
            
            var path = "/Users(EmployeeId='" + objectContext.EmployeeId + "',SapId='" + objectContext.SapId + "')";
            var detailView = this.getView().byId("detailEmployeeView");
            detailView.bindElement("employeeModel>" + path  );

            var oJSONModelConfig = detailView.getModel("jsonModelConfig");
            oJSONModelConfig.setProperty("/isSelectedOne", true);

        }, 

        onFilter: function(oEvent) {
            //var data = this.getView().getModel("employeeModelFilter").getData();

            var valueToFilter  = this.getView().getModel("jsonModelFilter").getData().valueToFilter; 
            var oFilter = new Filter({  filters: [  new Filter("FirstName", FilterOperator.Contains , valueToFilter),
                                                    new Filter("LastName", FilterOperator.Contains , valueToFilter),
                                                    new Filter("Dni", FilterOperator.Contains , valueToFilter)
                                                ],
                                                and: false
                                    });

            var oList = this.getView().byId("listEmployees");
            var oBinding = oList.getBinding("items");
            oBinding.filter(oFilter)

        },

         onBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", true);
            }
        },

    });
});