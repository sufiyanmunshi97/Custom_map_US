import * as d3 from 'd3'
import { formatType, handleErrors } from '../common/utils'

import {
  Link,
  Looker,
  LookerChartUtils,
  Row,
  VisConfig,
  VisualizationDefinition
} from '../types/types'

// Global values provided via the API
declare var looker: Looker
declare var LookerCharts: LookerChartUtils

// https://observablehq.com/@d3/zoomable-raster-vector@187
export default function define(runtime, observer) {
  const main = runtime.module();
//   main.variable(observer()).define(["md"], function(md){return(
// md`# Zoomable Raster & Vector

// This notebook combines [d3-tile](https://github.com/d3/d3-tile) for displaying raster map tiles, [d3-zoom](https://github.com/d3/d3-zoom) for panning and zooming, [d3-geo](https://github.com/d3/d3-geo) for rendering vector geometry, and [TopoJSON](https://github.com/topojson) for efficient representation of vector geometry.`
// )});
  main.variable(observer("map")).define("map", ["d3","width","height","initialScale","initialCenter","url","feature"], function(d3,width,height,initialScale,initialCenter,url,feature)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const projection = d3.geoMercator()
      .scale(1 / (2 * Math.PI))
      .translate([0, 0]);

  const render = d3.geoPath(projection);

  const tile = d3.tile()
      .extent([[0, 0], [width, height]])
      .tileSize(512);

  const zoom = d3.zoom()
      .scaleExtent([1 << 10, 1 << 15])
      .extent([[0, 0], [width, height]])
      .on("zoom", () => zoomed(d3.event.transform));

  let image = svg.append("g")
      .attr("pointer-events", "none")
    .selectAll("image");

  const path = svg.append("path")
      .attr("pointer-events", "none")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");
      

  svg
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(-initialScale)
          .translate(...projection(initialCenter))
          .scale(-1));

  function zoomed(transform) {
    const tiles = tile(transform);

    image = image.data(tiles, d => d).join("image")
        .attr("xlink:href", d => url(...d))
        .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
        .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
        .attr("width", tiles.scale)
        .attr("height", tiles.scale);
        

    projection
        .scale(transform.k / (2 * Math.PI))
        .translate([transform.x, transform.y]);

    path.attr("d", render(feature));
  }

  return svg.node();
}
);
  main.variable(observer("url")).define("url", function(){return(
(x, y, z) => `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/${z}/${x}/${y}${devicePixelRatio > 1 ? "@2x" : ""}?access_token=pk.eyJ1IjoicXVhemloYXJpcyIsImEiOiJja2RsZGQxMnUwMXlhMndxbjRrY3g4ZnZmIn0.bIV6NVNSQ4mNixKJLNHOUg`
)});
  main.variable(observer("height")).define("height", function(){return(
600
)});
  main.variable(observer("initialCenter")).define("initialCenter", function(){return(
[-98 - 35 / 60, 39 + 50 / 60]
)});
  main.variable(observer("initialScale")).define("initialScale", function(){return(
1 << 12
)});
  main.variable(observer("feature")).define("feature", ["d3","topojson"], function(d3,topojson){return(
d3.json("https://raw.githubusercontent.com/sufiyanmunshi97/US-boundaries/master/map.topojson").then(topology => topojson.feature(topology, topology.objects.collection))
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5", "d3-tile@1")
)});
  return main;
}
looker.plugins.visualizations.add(vis)