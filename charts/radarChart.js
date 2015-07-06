(function(){
  var model = raw.model();
  var attribute = model.dimension().title("Attribute").types(String).required(1);
  var charA = model.dimension().title("Character A").types(Number).required(1);
  var charB = model.dimension().title("Character B").types(Number);
  var charC = model.dimension().title("Character C").types(Number);

  model.map(function(data) {
    return data.map(function(d) {
      return {
        attribute: attribute(d),
        charA: +charA(d),
        charB: +charB(d),
        charC: +charC(d),
      };
    });
  });

  var chart = raw.chart()
      .title("Radar Chart")
      .description("")
      .description("能力值雷達圖，用雷達方式將各種屬性間的強弱比較出來。支援最多同時比較三個角色")
      .thumbnail("imgs/radarChart.png")
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

  var maxvalue = chart.number()
      .title('最大值')
      .defaultValue(100);

  var colorMap = chart.color()
      .title('顏色對應');
 
  chart.draw(function(selection, data) {
    var w = width();
    var h = height();
    var m = (w > h ? h/2 : w/2);
    var mtop = margin() + 20 + 12;
    var mleft = margin() + 40;

    function polyline(vlist) {
      path = ""
      for(var idx = 0; idx < vertexNumber; idx ++) {
        v = (typeof(vlist)==typeof([])?vlist[idx]:vlist);
        path += ((idx==0?"M":"L") + 
          (w / 2 + Math.cos( idx * Math.PI * 2 / vertexNumber ) * v) + " " +
          (h / 2 + Math.sin( idx * Math.PI * 2 / vertexNumber ) * v)
        )
      }
      path += "Z";
      return path;
    }

    colorMap.domain(["底圖顏色", "角色 A", "角色 B", "角色 C"], function(d) { return d; });

    selection
      .attr("width", w)
      .attr("height", h)
    var max = maxvalue();
    var gridtick = d3.scale.linear().domain([0,1]).range([0,max]);
    var base = selection.append("g").attr("class", "base");
    var grid = base.selectAll("path.grid").data(gridtick.ticks(5));
    var vertexNumber = data.length;
    grid.enter().append("path").attr({
      stroke: colorMap()("底圖顏色"),
      "stroke-wdith": "1",
      fill: "none",
      d: function(d) { return polyline(gridtick(d)); }
    });
    clist = [];
    ckey = ["charA", "charB", "charC"];
    cmap = { "charA": "角色 A", "charB": "角色 B", "charC": "角色 C" };
    names = [];
    for(key in ckey) {
      key = ckey[key];
      list = [];
      for(var idx = 0; idx < data.length ; idx ++ ) {
        item = data[idx];
        list.push(item[key]);
      }
      list.name = cmap[key];
      clist.push(list);
    }
    for(var idx = 0; idx < data.length; idx ++ ) {
      names.push(data[idx].attribute);
    }
    console.log(names);
    var label = base.selectAll("text.label").data(names).enter().append("text").attr({
      class: "label",
      x: function(d,i) {return w / 2 + Math.cos(i * Math.PI * 2 / data.length) * max * 1.2; },
      y: function(d,i) {return h / 2 + Math.sin(i * Math.PI * 2 / data.length) * max * 1.2; },
      "text-anchor": "middle",
      "dominant-baseline": "central"
    }).text(function(d) { return d;});

    clist = clist.filter(function(d) { return d[0]; });
    var charGroup = selection.append("g").attr({"class":"charGroup"});
    var chars = charGroup.selectAll("g.char").data(clist);
    chars.enter().append("g")
      .attr({ class: "char" })
    charGroup.selectAll("g.char").each(function(d,i) {
      d3.select(this).selectAll("circle").data(d).enter().append("circle").attr({
        cx: function(v,i) { return w / 2 + Math.cos(i * Math.PI * 2 / d.length) * v; },
        cy: function(v,i) { return h / 2 + Math.sin(i * Math.PI * 2 / d.length) * v; },
        r: 5,
        fill: colorMap()(d.name),
        stroke: "none"
      });
      d3.select(this).append("path").attr({
        class: "char",
        fill: "none",
        stroke: function(d) { return colorMap()(d.name); },
        "stroke-width": 3,
        d: function(d) {
          return polyline(d);
        }
      });
    });
  });
})();
