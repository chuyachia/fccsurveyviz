import Graph from '../components/Graph';
import Pie from '../components/Pie';
import palette from 'google-palette';
import * as d3 from "d3";

export default function(data){
    var educationData = data;
    var eduPie = Object.assign({},Graph,Pie,{degreedata:educationData.degree,majordata:educationData.major,h:600,radius:180,id:'education',title:'Educational background'});
    var majorCats = eduPie.majordata.map(function(d){return d.value});
    majorCats = majorCats.filter(function(d,i){return majorCats.indexOf(d)==i});
    var categoryColors2 = palette('tol-dv',majorCats.length);
    var degreeCats = eduPie.degreedata.map(function(d){return d.value});
    var categoryColors1 = palette('tol-dv',degreeCats.length);
    var totalCoders = eduPie.majordata.map(function(d){return d.count}).reduce(function(a,b){return a+b});
    eduPie.createChart();
    eduPie.chart.attr('transform','translate('+eduPie.w/2+','+eduPie.h/2+')');
    eduPie.createPie(function(d){return d.count});
    
    eduPie.drawPie = function(data,category,classname,colors,outerradius,innerradius){
        eduPie.createArc(outerradius,innerradius);
        eduPie.createColor(category,colors);
    
        eduPie.chart.attr('transform','translate('+eduPie.w/2+','+eduPie.h/2+')');
        eduPie.chart.selectAll(classname)
        .data(eduPie.pie(data))
        .enter()
        .append('g')
        .attr('class',classname)
        .on('mouseover',function(d){
          if (d.data.value!=="NA"){
              d3.select(this)
              .append('foreignObject')
              .attr('width',eduPie.radius)
              .attr('height',eduPie.radius)
              .attr('transform','translate('+(-eduPie.radius/2)+','+(-eduPie.radius/3)+')')
              .attr('class','edu-text')
              .append('xhtml:p')
              .text(function(d){
                  if (d.data.degree){
                      return Math.round(d.data.count/d.data.degreetotal*100) + "% of coders with "+d.data.degree+" major in " +d.data.value;
                  } else {
                      return Math.round(d.data.count/totalCoders*100) + "% of coders have "+d.data.value;
                  }
              });
          }
        })
        .on('mouseout',function(){
          d3.selectAll('.edu-text').remove();
        })
        .append('path')
        .attr('d',eduPie.arc)
        .style('fill',function(d){
            if (d.data.value=="NA")
                return 'ffffff';
            else
                return eduPie.piecolor(d.data.value);
         });
    };
    eduPie.drawPie(eduPie.degreedata,degreeCats,'layer1',categoryColors1,eduPie.radius,eduPie.radius/2);
    eduPie.drawPie(eduPie.majordata,majorCats,'layer1',categoryColors2,eduPie.radius*1.5,eduPie.radius);
    d3.select('#'+eduPie.id+' .loader').remove();
}