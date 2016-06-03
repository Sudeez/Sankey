var units = "Members";
 
var markElementWidth = 15;

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1200 - margin.left - margin.right,
    height = 740 - margin.top - margin.bottom;
 
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scale.category10();


var isTransitioning,
    INFLOW_COLOR = "#2E86D1",
OUTFLOW_COLOR = "#D63028";
var OPACITY = {
    NODE_DEFAULT: 0.9,
    //NODE_FADED: 0.1,
    //NODE_HIGHLIGHT: 0.8,
    LINK_DEFAULT: 0.9,
    LINK_FADED: 0.02,
    LINK_HIGHLIGHT: 0.9
},
 LINK_COLOR = "#000",
TRANSITION_DURATION = 400;
TYPE_COLORS = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d","#E8B187","#AFAAF2","#7FEBA1"];
 
// append the svg canvas to the page
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");
 

var defs;
// for arrow direction//

defs = svg.append("defs");

defs.append("marker")
  .style("fill", OUTFLOW_COLOR)
  .attr("id", "arrowHeadInflow")
  .attr("viewBox", "0 0 6 10")
  .attr("refX", "0")
  .attr("refY", "5")
  .attr("markerUnits", "strokeWidth")
  .attr("markerWidth", "1")
  .attr("markerHeight", "1")
  .attr("orient", "auto")
  .append("path")
    .attr("d", "M 0 0 L 1 0 L 6 5 L 1 10 L 0 10 z");

defs.append("marker")
  .style("fill", INFLOW_COLOR)
  .attr("id", "arrowHeadOutlow")
  .attr("viewBox", "0 0 6 10")
  .attr("refX", "0")
  .attr("refY", "5")
  .attr("markerUnits", "strokeWidth")
  .attr("markerWidth", "1")
  .attr("markerHeight", "1")
  .attr("orient", "auto")
  .append("path")
    .attr("d", "M 0 0 L 1 0 L 6 5 L 1 10 L 0 10 z");


// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(10)
    .size([width, height]);
 
var path = sankey.link();
 
// load the data
//d3.json("data/data007.json", function (error, graph) {
    d3.json("data/create01.json", function (error, graph) {
   
    function appendMark(index) {
        if (graph.RestValue[index].value > 0)
        {
            d3.select("#chart").select(".node" + graph.RestValue[index].index)
            .append("rect")
            .attr("height", function (d) { return (d.kyValue * graph.RestValue[index].value); })
            .attr("y", function (d) {
                return d3.select("#chart").select(".node" + graph.RestValue[index].index)
                    .select("rect").attr("height") - d.kyValue * graph.RestValue[index].value;
            })
            .attr({
                "width": markElementWidth, "x": sankey.nodeWidth(), fill:"red", opacity: 1.5, rx: "10", ry: "10" })


            //       function (d) {
            //    d.color = color(d.name.replace(/ .*/, ""));
            //    return d.color;
            //}, opacity: 1.5, rx: "10", ry: "10"}) // "red", opacity: 1.5, rx: "10", ry: "10" })


            d3.select("#chart").select(".node" + graph.RestValue[index].index).append("path")
            .attr("transform", function (d) {
                return "translate(" + (markElementWidth * 3) + "," + (parseFloat(d3.select("#chart").select(".node" + graph.RestValue[index].index)
                        .select("rect").attr("height")) + 8) + ")";
            })
            .attr("d", d3.svg.symbol().type("triangle-down").size(130));

        }
    }


    var nodeMap = {};

    graph.nodes.forEach(function (x) { nodeMap[x.name] = x; });
   
    graph.links = graph.links.map(function (x) {
        return {
            source: nodeMap[x.source],
            target: nodeMap[x.target],
            value: x.value
        };
    });
     
    graph.RestValue= graph.RestValue.map(function (x) {
        return {
            index: x.index,
            value: x.value
        };
    });
    graph.nodes.ShortValues = graph.RestValue.map(function (x) {
        return {
            index: x.index,
            value: x.value
        };
    });

        
       
    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });
 
    // add the link titles
    link.append("title")
          .text(function(d) {
              return d.source.name + " → " + 
                      d.target.name + "\n" + format(d.value); });
 
    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", function (d, i) { return "node" + i; })
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() { 
            this.parentNode.appendChild(this); })
        .on("drag", dragmove));
 
    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
            return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); })
      .append("title")
        .text(function (d,i) {
            //console.log(graph.RestValue[i])
            appendMark(i);
            return d.DisplayName + "\n" + format(d.value);
        });
 

    function restoreLinksAndNodes() {
        link
          .style("stroke", LINK_COLOR)
        .attr("class", "link")
          .style("marker-end", function () { return 'url(#arrowHead)'; })
          .transition()
            .duration(TRANSITION_DURATION)
            .style("opacity", OPACITY.LINK_DEFAULT);

        node
          .selectAll("rect")
            .style("fill", function (d) {
                d.color = color(d.name.replace(/ .*/, ""));
                return d.color;
            })
            .style("stroke", function (d) {
                return d3.rgb(color(d.name.replace(/ .*/, ""))).darker(0.1);
            })
            .style("fill-opacity", OPACITY.NODE_DEFAULT)
        .text(function (d, i) {
            //console.log(graph.RestValue[i])
            appendMark(i);            
        });

        //node.filter(function (n) { return n.state === "collapsed"; })
        //  .transition()
        //    .duration(TRANSITION_DURATION)
        //    .style("opacity", OPACITY.NODE_DEFAULT);
    }

        //add in mouse move and left
    node.on("mouseenter", function (g) {
        
        if (!isTransitioning) {
            //restoreLinksAndNodes();
            highlightConnected(g);
            fadeUnconnected(g);

            d3.select(this).select("rect")
              .style("fill", function (d) {
                  d.color = d.netFlow > 0 ? INFLOW_COLOR : OUTFLOW_COLOR;
                  return d.color;
              })
              .style("stroke", function (d) {
                  return d3.rgb(d.color).darker(0.1);
              })
              .style("fill-opacity", OPACITY.LINK_DEFAULT);

            //tooltip
            //  .style("left", g.x + MARGIN.LEFT )
            //  .style("top", g.y + g.height + MARGIN.TOP + 15 )
            //  .transition()
            //    .duration(TRANSITION_DURATION)
            //    .style("opacity", 1).select(".value")               
        }
    });

    node.on("mouseleave", function () {
        if (!isTransitioning) {
            //hideTooltip();
            restoreLinksAndNodes();
        }
    });

    function highlightConnected(g) {
        link.filter(function (d) { return d.source === g; })
          .style("marker-end", function () { return 'url(#arrowHeadInflow)'; })
          .style("stroke", OUTFLOW_COLOR)
          .style("opacity", OPACITY.LINK_DEFAULT);

        link.filter(function (d) { return d.target === g; })
          .style("marker-end", function () { return 'url(#arrowHeadOutlow)'; })
          .style("stroke", INFLOW_COLOR)
          .style("opacity", OPACITY.LINK_DEFAULT);
    }

    function fadeUnconnected(g) {
        link.filter(function (d) { return d.source !== g && d.target !== g; })
          .style("marker-end", function () { return 'url(#arrowHead)'; })
          .transition()
            .duration(TRANSITION_DURATION)
            .style("opacity", OPACITY.LINK_FADED);

        node.filter(function (d) {
            return (d.name === g.name) ?false : !svg.connected(d, g);
        }).transition()
          .duration(TRANSITION_DURATION)
          .style("opacity", OPACITY.NODE_FADED);
    }


        // for HIde ToolTip

        //hideTooltip = function () {
        //    return tooltip.transition()
        //      .duration(TRANSITION_DURATION)
        //      .style("opacity", 0);
        //},

    //for (i = 0; i < graph.RestValue.length; i++) {
    //    //data.RestValue[i] += 1;
    //    var det = graph.RestValue[i].index;
    //    if (graph.RestValue[i].value != 0) {
    //        d3.select("#chart").select(".node" + graph.RestValue[i].index)
    //    .append("rect")
    //    .attr("height", function (d) { return (d.kyValue * graph.RestValue[i].value); })
    //    .attr("y", function (d) {
    //        return d3.select("#chart").select(".node" + graph.RestValue[i].index)
    //            .select("rect").attr("height") - d.kyValue * graph.RestValue[i].value;
    //    })
    //    .attr({ "width": markElementWidth, "x": sankey.nodeWidth(), fill: "rgb(231,142,26)" })
    //        d3.select("#chart").select(".node" + graph.RestValue[i].index).append("path")
    //        .attr("transform", function (d) {
    //            return "translate(" + (markElementWidth * 2) + "," + (parseFloat(d3.select("#chart").select(".node" + graph.RestValue[i].index)
    //                    .select("rect").attr("height")) + 8) + ")";
    //        })
    //        .attr("d", d3.svg.symbol().type("triangle-down").size(130));
    //    }
    //}
//}

    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) { return d.name + "(" + d.value + ")"; })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start")
    .text(function (d) {
        return d.DisplayName + "(" + d.value + ")";
    });
 
// the function for moving the nodes
function dragmove(d) {
    d3.select(this).attr("transform", 
        "translate(" + (
               d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
            ) + "," + (
                   d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
    sankey.relayout();
    link.attr("d", path);
}
});
 
