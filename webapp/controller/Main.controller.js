sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("r8ll.com.zui5tscharts.controller.Main", {
        onInit() {
            // local data model
            var oJsonModel = new sap.ui.model.json.JSONModel();
            this.getOwnerComponent().setModel(oJsonModel, "chartData");
           
            // local settings model
            var oSettingsModel = new sap.ui.model.json.JSONModel();
            oSettingsModel.setProperty("/chartTypes", [{ key: "Line Chart", value: "line"}, { key: "Stacked Column", value: "stacked_column"}, { key: "Stacked Column 100%", value: "100_stacked_column"} ]);
            oSettingsModel.setProperty("/selectedChartType", "stacked_column");
            this.getOwnerComponent().setModel(oSettingsModel, "settings");
        },
        
        onUpload: function (oEvent) {
            var oItem = oEvent.getParameters().item;
            var sFilename = oItem.getFileName();
            var oFileReader = new FileReader();
            oFileReader.addEventListener(
                "load",
                function () {
                var sText = oFileReader.result;
                var aCsv = this._parseCsv(sText, ";");
                var aFlatData = [];
                for(let i = 1; i < aCsv.length; ++i) {
                    var oFlatDataEntry = {};
                    oFlatDataEntry.Period = aCsv[i][0];
                    for(let j = 1; j < aCsv[i].length; ++j) {
                        oFlatDataEntry[aCsv[0][j]] = parseFloat(aCsv[i][j]);
                    }
                    aFlatData.push(oFlatDataEntry);
                }
                this._initDataModel(aCsv[0], aFlatData, sFilename);
    
                }.bind(this)
            );
            oFileReader.readAsText(oItem.getFileObject());
        },

        _parseCsv: function(csvText, delimitter) {
            return csvText.trim().split(/\r?\n/).filter(l => l.trim() != '').map(line => line.split(delimitter));
        },

        _initDataModel: function(aHeadings, aFlatData, sFilename) {
            var oVizFrame = this.byId("idVizFrame");
            oVizFrame.removeAllFeeds();
          
            
            var oModel = this.getOwnerComponent().getModel("chartData");
            oModel.setData({ chartData: aFlatData });

            var aDimensions = [ { name : "Period", value : "{chartData>Period}" } ];
            var aMeasures = [];
            var aFeedValues = [];
            for(let i = 1; i < aHeadings.length; ++i) {
                var sValue = "{chartData>" + aHeadings[i] + "}";
                aMeasures.push({ name: aHeadings[i], value: sValue });
                aFeedValues.push( aHeadings[i] );
            }
            var oDataset = new sap.viz.ui5.data.FlattenedDataset({
                    dimensions: aDimensions,
                    measures: aMeasures,
                    data: { path: "chartData>/chartData" }
                });
            oVizFrame.setDataset(oDataset);

            oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "valueAxis", 
                    type: "Measure",
                    values: aFeedValues
            }));
            oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
                uid: "categoryAxis", 
                type: "Dimension", 
                values: [ "Period" ]
            }));
            var oVizProperties = {
				interaction: {
					zoom: {
						enablement: "enabled"
					},
					// selectability: {
					// 	mode: "EXCLUSIVE"
					// }
				},
				// valueAxis: {
				// 	title: {
				// 		visible: false
				// 	},
				// 	visible: true,
				// 	axisLine: {
				// 		visible: false
				// 	},
				// 	label: {
				// 		linesOfWrap: 2,
				// 		visible: false,
				// 		style: {
				// 			fontSize: "10px"
				// 		}
				// 	}
				// },
				// categoryAxis: {
				// 	title: {
				// 		visible: false
				// 	},
				// 	label: {
				// 		linesOfWrap: 2,
				// 		rotation: "fixed",
				// 		angle: 0,
				// 		style: {
				// 			fontSize: "12px"
				// 		}
				// 	},
				// 	axisTick: {
				// 		shortTickVisible: false
				// 	}
				// },
				title: {
					text: sFilename,
					visible: true
				},
				legend: {
					visible: true
				},
				// plotArea: {
				// 	colorPalette: ["#007181"],
				// 	gridline: {
				// 		visible: false
				// 	},
				// 	dataLabel: {
				// 		visible: true,
				// 		style: {
				// 			fontWeight: 'bold'
				// 		},
				// 		hideWhenOverlap: false
				// 	},
				// 	seriesStyle: {
				// 		"rules": [{
				// 			"dataContext": {
				// 				"Budget": '*'
				// 			},
				// 			"properties": {
				// 				"dataPoint": {
				// 					"pattern": "noFill"
				// 				}
				// 			}
				// 		}]
				// 	},
				// 	dataPointStyleMode: "update",
				// 	dataPointStyle: {
				// 		"rules": [{
				// 			"dataContext": [{
				// 				Period: { in : ["Q1 '18", "Q2 '18"]
				// 				},
				// 				"Actuals": "*"
				// 			}],
				// 			"properties": {
				// 				"pattern": "diagonalLightStripe"
				// 			},
				// 			displayName: "Forecast"
				// 		}]
				// 	}
				// }
			};
            oVizFrame.setVizProperties(oVizProperties);

        },

    });
});