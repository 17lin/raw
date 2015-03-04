(function(){
  var model = raw.model();
  var length = model.dimension().title("Length").types(Number).required(1);
  var name = model.dimension().title("Label").types(String);

  model.map(function(data) {
    return data.map(function(d) {
      return {
        length: +length(d),
        name: name(d)
      };
    });
  });

  var chart = raw.chart()
      .title("Curved Bar Chart")
      .description("Curved bar chart should be used carefully, since it distorts the original bar into something that is less straightforward. It is usually used along with infographics, for example, 'Global resources stock check' by BBC, 2012.")
      .thumbnail("imgs/curvedBarChart.png")
      .model(model);

  var width = chart.number()
      .title('Width')
      .defaultValue(900);

  var height = chart.number()
      .title('Height')
      .defaultValue(600);

  var margin = chart.number()
      .title('margin')
      .defaultValue(10);

  chart.draw(function (selection, data){
    var w = width();
    var h = height();
    var m = (w > h ? h/2 : w/2);

    var arc = d3.svg.arc();
    var max = d3.max(data.map(function(d) { return d.length;}));
    var len = data.length;
    var dmap = d3.scale.linear().domain([-2, len + 1]).range([0,m]);
    var rmap = d3.scale.linear().domain([0, max]).range([0, Math.PI * 1.5]);
    var color = d3.scale.category20();

    selection
      .attr("width", w)
      .attr("height", h)
    pathgroup = selection.append("g").attr({
      transform: "translate("+(w/2)+","+(h/2)+")"
    });
    textgroup = selection.append("g").attr({
      transform: "translate("+(w/2)+","+(h/2)+")"
    });

    pathgroup.selectAll("path").data(data).enter().append("path");
    pathgroup.selectAll("path").attr({
      d: function(d,i) {
           return arc.outerRadius(dmap(i+1) - 2).innerRadius(dmap(i)).startAngle(0).endAngle(rmap(d.length))();
         },
      fill: function(d,i) { return color(d.name); }
    });

    textgroup.selectAll("text").data(data).enter().append("text");
    textgroup.selectAll("text").attr({
      x: 0,
      y: function(d,i) { return -dmap(i + 0.5); },
      dx: -5,
      "text-anchor": "end",
      "dominant-baseline": "middle"
    }).text(function(d,i){return d.name;});
  });
})();
