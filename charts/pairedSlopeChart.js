(function(){
  var model = raw.model();
  var date = model.dimension().title("Date").required(1);
  var valueA = model.dimension().title("Value A").types(Number).required(1);
  var valueB = model.dimension().title("Value B").types(Number).required(1);

  model.map(function(data) {
    return data.map(function(d) {
      return {
        date: date(d),
        valueA: +valueA(d),
        valueB: +valueB(d),
      };
    });
  });

  var chart = raw.chart()
      .title("Paired Slope Chart")
      .description("")
      .thumbnail("imgs/pairedBarChart.png")
      .model(model);

  var width = chart.number()
      .title('寬度')
      .defaultValue(900);

  var height = chart.number()
      .title('高度')
      .defaultValue(600);

  var margin = chart.number()
      .title('邊寬')
      .defaultValue(10);

  var colorMap = chart.color()
      .title('顏色對應');
 
  chart.draw(function (selection, data){
    var w = width();
    var h = height();
    var m = (w > h ? h/2 : w/2);
    var mtop = margin() + 20 + 12;
    var mleft = margin() + 40;

    colorMap.domain(["A 組顏色", "B 組顏色", "線段顏色"], function(d) { return d; });

    selection
      .attr("width", w)
      .attr("height", h)
    var max = data[0].valueA;
    var min = data[0].valueB;
    for(i=0;i<data.length;i++) {
      if(max < data[i].valueA) max = data[i].valueA;
      if(max < data[i].valueB) max = data[i].valueB;
      if(min > data[i].valueA) min = data[i].valueA;
      if(min > data[i].valueB) min = data[i].valueB;
      data[i].idx = i;
    }
    var x = d3.scale.linear().domain([0,data.length]).range([mleft, w - margin()]);
    var y = d3.scale.linear().domain([max * 1.05,min]).range([mtop, h - margin()]);
    var yticks = y.ticks(10);
    var yAxis = selection.append("g").attr("class", "yAxis");
    yAxis.selectAll("text").data(yticks).enter().append("text").text(function(d){return d;}).attr({
      x: 20, y: function(d) { return y(d); },
      "text-anchor": "middle", "dominant-baseline": "central"
    });
    selection.selectAll("g.pair").data(data).enter().append("g").attr("class","pair");
    selection.selectAll("g.pair").each(function(d, idx) {
      var x1 = x(idx) + (x(idx + 1) - x(idx)) * 0.2;
      var x2 = x(idx) + (x(idx + 1) - x(idx)) * 0.8;
      var y1 = y(d.valueA);
      var y2 = y(d.valueB);

      root = d3.select(this);
      root.append("rect").attr({
        x: x(idx),
        width: x(idx + 1) - x(idx),
        y: mtop,
        height: h - margin(),
        fill: (idx%2?"#eee":"#fff")
      });

      root.append("line").attr({
        x1: x(idx) + 1,
        x2: x(idx + 1) - 1,
        y1: mtop,
        y2: mtop,
        stroke: (y1 == y2 ? "#ddd" : (y1 > y2 ? colorMap()("A 組顏色") : colorMap()("B 組顏色"))),
        "stroke-width": "2"
      });

      root.append("text").attr({
        x: ( x(idx) + x(idx + 1) ) / 2,
        y: mtop - 10,
        "text-anchor": "middle",
        "dominant-baseline": "central"
      }).text(d.date);

      root.append("line").attr({
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2,
        stroke: colorMap()("線段顏色")
      })

      root.append("circle").attr({
        cx: x1,
        cy: y1,
        r: 8,
        fill: colorMap()("A 組顏色")
      });

      root.append("circle").attr({
        cx: x2,
        cy: y2,
        r: 8,
        fill: colorMap()("B 組顏色")
      });

      labelstyle = {
        "text-anchor": "middle",
        "dominant-baseline": "central",
        "font-size": "12"
      };
      root.append("text").attr({
        x: x1, y: y1, fill: "#fff"
      }).style(labelstyle).text("A");
      root.append("text").attr({
        x: x2, y: y2, fill: "#000"
      }).style(labelstyle).text("B");
    });
  });
})();
