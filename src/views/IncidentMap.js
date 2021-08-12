import am4geodata_usaHigh from "@amcharts/amcharts4-geodata/usaHigh";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import React, { useEffect, useLayoutEffect, useState } from 'react';

am4core.useTheme(am4themes_animated);

/*

Example comes from here
https://www.amcharts.com/docs/v4/getting-started/integrations/using-react/

*/

//mapData is result from api/stats.total
const IncidentMap = (props) => {
  //const map = am4core.create("chartdiv", am4maps.MapChart);
  const [mapPolygonSeries, setMapPolygonSeries] = useState();

  const updateMap = (mapStatistics) => {
    if (!mapPolygonSeries) return;
    //mapStatistics ["NJ" : count]
    let data = [];
    for (const state in mapStatistics) {
      data.push({
        id: "US-" + state,
        value: mapStatistics[state]
      })
    }
    mapPolygonSeries.data = data;
  }
  var currentActiveState, currentActiveStateZIndex;
  useEffect(() => {
    updateMap(props.mapData);
  }, [props.mapData]);
  //componentDidMount
  useLayoutEffect(() => {
    let map = am4core.create("chartdiv", am4maps.MapChart);
    map.geodata = am4geodata_usaHigh;
    map.projection = new am4maps.projections.AlbersUsa();
    map.chartContainer.wheelable = false;
    map.seriesContainer.draggable = false;
    map.seriesContainer.resizable = false;
    map.maxZoomLevel = .5;
    let polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    polygonSeries.heatRules.push({
      property: "fill",
      target: polygonSeries.mapPolygons.template,
      min: am4core.color("#9F833B"), //minimal color
      max: am4core.color("#FCEB4F"),
    });
    let heatLegend = map.createChild(am4maps.HeatLegend);
    heatLegend.series = polygonSeries;
    heatLegend.align = "right";
    heatLegend.width = am4core.percent(10);
    heatLegend.marginRight = am4core.percent(4);
    heatLegend.minValue = 0;
    heatLegend.maxValue = 100;
    heatLegend.valign = "bottom";
    heatLegend.orientation = "vertical";
    polygonSeries.data = [];
    // map.homeZoomLevel = 1;
    // map.zoomControl = new am4maps.ZoomControl();
    // map.zoomControl.align = "left";
    // map.zoomControl.valign = "bottom";
    // map.zoomControl.dy = -20;
    // map.zoomControl.minusButton.background.fill = am4core.color("#C7D0FF");
    // map.zoomControl.minusButton.background.fillOpacity = 0.24;
    // map.zoomControl.minusButton.background.stroke = null;
    // map.zoomControl.plusButton.background.fill = am4core.color("#C7D0FF");
    // map.zoomControl.plusButton.background.fillOpacity = 0.24;
    // map.zoomControl.plusButton.background.stroke = null;
    // map.zoomControl.plusButton.label.fill = am4core.color("#fff");
    // map.zoomControl.plusButton.label.fontWeight = 600;
    // map.zoomControl.plusButton.label.fontSize = 16;
    // map.zoomControl.minusButton.label.fill = am4core.color("#fff");
    // map.zoomControl.minusButton.label.fontWeight = 600;
    // map.zoomControl.minusButton.label.fontSize = 16;
    // let plusButtonHoverState = map.zoomControl.plusButton.background.states.create(
    //   "hover"
    // );
    // plusButtonHoverState.properties.fillOpacity = 0.24;
    // let minusButtonHoverState = map.zoomControl.minusButton.background.states.create(
    //   "hover"
    // );
    // minusButtonHoverState.properties.fillOpacity = 0.24;
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipHTML =
      "<strong>{name}:<strong> {value}";
    polygonTemplate.fill = am4core.color("#AAAAAA");
    polygonTemplate.fillOpacity = 1;
    polygonTemplate.clickable = true;
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fillOpacity = 0.5;

    let activeStates = polygonTemplate.states.create("active");
    activeStates.properties.strokeWidth = 3;
    activeStates.properties.stroke = am4core.color("#FCEB4F");
    var activeShadow = activeStates.filters.push(new am4core.DropShadowFilter);
    activeShadow.dx = 6;
    activeShadow.dy = 6;
    activeShadow.opacity = 0.3;

    polygonTemplate.events.on("hit", function(ev) {
      if ( currentActiveState == ev.target ) return;
      if ( currentActiveState ) {
        currentActiveState.isActive = false;
        console.log("Restore zindex to:", currentActiveStateZIndex);
        // currentActiveState.toBack();
        currentActiveState.zIndex = currentActiveStateZIndex;
        currentActiveState.setState("default")
      }

      //https://www.amcharts.com/docs/v4/tutorials/consistent-outlines-of-map-polygons-on-hover/
      currentActiveState = ev.target;
      currentActiveStateZIndex = currentActiveState.zIndex;
      currentActiveState.zIndex = Number.MAX_VALUE;
      currentActiveState.toFront();
      currentActiveState.setState("active")
    });

    polygonTemplate.stroke = am4core.color("#6979C9");
    polygonTemplate.strokeOpacity = 1;
    setMapPolygonSeries(polygonSeries);
    return () => {
      map.dispose();
    };
  }, []);
  return <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
}

export default IncidentMap
