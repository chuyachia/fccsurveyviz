import Graph from '../components/Graph';
import Pie from '../components/Pie';
import palette from 'google-palette';
import * as d3 from "d3";


export default function(data){
    var eduPie = Object.assign({},Graph,Pie,{data:{degree:data.degree,major:data.major},h:600,radius:180,id:'education',title:'Educational background'});
    var totalCoders = eduPie.data.major.map(function(d){return d.count}).reduce(function(a,b){return a+b});
    eduPie.data.initmajor = eduPie.data.major.map(function(d,i){return i==0?Object.assign({},d,{count:totalCoders}):Object.assign({},d,{count:0})});
    eduPie.data.initdegree = eduPie.data.degree.map(function(d,i){return i==0?Object.assign({},d,{count:totalCoders}):Object.assign({},d,{count:0})});
    var majorCats = eduPie.data.major.map(function(d){return d.value});
    majorCats = majorCats.filter(function(d,i){return majorCats.indexOf(d)==i});
    var categoryColors2 = palette('tol-dv',majorCats.length);
    var degreeCats = eduPie.data.degree.map(function(d){return d.value});
    var categoryColors1 = palette('tol-dv',degreeCats.length);
    eduPie.pie = eduPie.createPie(function(d){return d.count});
    for(var k in eduPie.data){
        eduPie.data[k] = eduPie.pie(eduPie.data[k]);
    }

    eduPie.createChart();
    eduPie.chart.attr('transform','translate('+eduPie.w/2+','+eduPie.h/2+')');

    
    eduPie.drawPie = function(initdata,realdata,category,classname,colors,outerradius,innerradius){
        
        function arcTween() {
            return function(d,i) {
                var interpolate = d3.interpolate(d, realdata[i]);
                return function(t) {
                    return arc(interpolate(t));
                };
            };
        }

        var arc = eduPie.createArc(outerradius,innerradius,classname);
        var colorscheme = eduPie.createColor(category,colors,classname);
    
        eduPie.chart.selectAll(classname)
        .data(initdata)
        .enter()
        .append('path')
        .attr('class',classname)
        .on('mouseover',function(d,i){
            console.log(d);
          if (d.data.value!=="NA"){
              eduPie.chart
              .append('foreignObject')
              .attr('width',eduPie.radius)
              .attr('height',eduPie.radius)
              .attr('transform','translate('+(-eduPie.radius/2)+','+(-eduPie.radius/3)+')')
              .attr('class','edu-text')
              .append('xhtml:p')
              .text(function(){
                  if (d.data.degree){
                      return Math.round(realdata[i].data.count/d.data.degreetotal*100) + "% of coders with "+d.data.degree+" major in " +d.data.value;
                  } else {
                      return Math.round(realdata[i].data.count/totalCoders*100) + "% of coders have "+d.data.value;
                  }
              });
          }
        })
        .on('mouseout',function(){
          d3.selectAll('.edu-text').remove();
        })
        .attr('d',arc)
        .style('fill',function(d){
            if (d.data.value=="NA")
                return 'ffffff';
            else
                return colorscheme(d.data.value);
         })
        .transition()
        .duration(3000)
        .attrTween("d", arcTween())
        .style('fill',function(d){
            if (d.data.value=="NA")
                return 'ffffff';
            else
                return colorscheme(d.data.value);
         });

    };
    eduPie.drawPie(eduPie.data.initdegree,eduPie.data.degree,degreeCats,'layer1',categoryColors1,eduPie.radius,eduPie.radius/2);
    eduPie.drawPie(eduPie.data.initmajor,eduPie.data.major,majorCats,'layer2',categoryColors2,eduPie.radius*1.5,eduPie.radius);
    d3.select('#'+eduPie.id+' .loader').remove();
}