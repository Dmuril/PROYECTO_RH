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

            onNavToNewEmployee: function () {
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("NewEmployee");
            },


            onNavToEmployeesList: function () {
                this._bus.publish("flexible", "_filterData", '{}');
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("EmployeesList");
            },

            onSignOrder : function(){
                window.open("https://59dd8479trial-dev-logali-approuter.cfapps.us10.hana.ondemand.com/logaligroupEmployees/index.html");
            },

            onAfterRendering() {
                // Error en el framework: Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL,
                // pero no funciona en la versión 1.78. Por tanto, una solución encontrada es eliminando la propiedad id del componente por jquery

                var genericTileFirmarPedido = this.byId("singOrder");
                //Id del dom
                var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
                //Se vacía el id
                jQuery("#" + idGenericTileFirmarPedido)[0].id = "";

            }
        });
    });
