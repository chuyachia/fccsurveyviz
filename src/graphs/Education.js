import Graph from '../components/Graph';
import Pie from '../components/Pie';
import palette from 'google-palette';
import * as d3 from "d3";


export default function(data,resizes){
    var zoomed = false;
    var eduPie = Object.assign({},Graph,Pie,{data:{degree:data.degree,major:data.major},margin:{top:0,left:0,bottom:0,right:0},id:'education',title:'Educational background'});
    eduPie.createChart();
    var totalCoders = eduPie.data.major.map(function(d){return d.count}).reduce(function(a,b){return a+b});
    var degreeCats = eduPie.data.degree.map(function(d){return d.value});
    var categoryColors1 = palette('tol-dv',degreeCats.length);    
    var majorCats = eduPie.data.major.map(function(d){return d.value});
    majorCats = majorCats.filter(function(d,i){return majorCats.indexOf(d)==i});
    var categoryColors2 = palette('tol-dv',majorCats.length);
    eduPie.pie = eduPie.createPie(function(d){return d.count});

    eduPie.calculateScale = function(){
        this.chart.attr('transform','translate('+this.outerWidth()/2+','+this.outerHeight()/2+')');
        this.radius = Math.min(this.innerWidth(),this.innerHeight())/3;        
    };
    
    eduPie.filterData = function(data,criteria,target){
        return data.map(function(d){return d[target]==criteria?d:Object.assign({},d,{count:0})});
    };
    
    eduPie.drawPie = function(data,category,classname,colors,outerradius,innerradius){
        var arc = eduPie.createArc(outerradius,innerradius);
        var colorscheme = eduPie.createColor(category,colors);
    
        eduPie.chart.selectAll('.'+classname)
        .data(eduPie.pie(data))
        .enter()
        .append('path')
        .attr('class',classname)
        .attr('d',arc)
        .style('fill',function(d){
            if (d.data.value=="NA")
                return 'F4F4E2';
            else
                return colorscheme(d.data.value);
         });
    };
    
    eduPie.updatePie  = function(classname,data,outerradius,innerradius){
        data = eduPie.pie(data);
        var arc = eduPie.createArc(outerradius,innerradius);        
        function arcTween() {
            return function(d,i) {
                var interpolate = d3.interpolate(d, data[i]);
                for (var k in data[i]) d[k] = data[i][k]; 
                return function(t) {
                    t  = interpolate(t);
                    return arc(t);
                };
            };
        }
        d3.selectAll('.'+classname)
        .transition()
        .duration(3000)
        .attrTween("d", arcTween(function(d){return d;}))
        .each(function(d,i){
            d3.select(this)
            .on('mouseover',function(){
                d3.select(this)
                .attr('opacity','0.8');
              if (d.data.value!=="NA"){
                  eduPie.chart
                  .append('foreignObject')
                  .attr('width',eduPie.radius)
                  .attr('height',eduPie.radius)
                  .attr('transform','translate('+(-eduPie.radius/2)+','+(-eduPie.radius/2)+')')
                  .attr('class','edu-text')
                  .append('xhtml:p')
                  .html(function(){
                      if (d.data.belongdegree){
                          return (d.data.count/d.data.degreetotal*100).toFixed(2) + "%<br>of coders with "+d.data.belongdegree+" major in " +d.data.value;
                      } else {
                          return (d.data.count/totalCoders*100).toFixed(2) + "%<br>of coders have "+d.data.value;
                      }
                  });
              }
            })
            .on('mouseout',function(){
              d3.select(this)
              .attr('opacity','1');
              d3.selectAll('.edu-text').remove();
            })
            .on('click',function(d){
                if(!d.data.belongdegree){
                    if (!zoomed) {
                        var majordata =  eduPie.filterData(eduPie.data.major,d.data.value,'belongdegree');
                        var degreedata =  eduPie.filterData(eduPie.data.degree,d.data.value,'value');
                        eduPie.updatePie('layer1',degreedata,eduPie.radius,eduPie.radius/2);
                        eduPie.updatePie('layer2',majordata,eduPie.radius*1.5,eduPie.radius);
                        zoomed =!zoomed;
                    } else {
                        eduPie.updatePie('layer1',eduPie.data.degree,eduPie.radius,eduPie.radius/2);
                        eduPie.updatePie('layer2',eduPie.data.major,eduPie.radius*1.5,eduPie.radius); 
                        zoomed =!zoomed;
                    }
                }
            });
        });
        
    };
    
    eduPie.resizePie = function(classname){
        var outerradius,
        innerradius;
        if (classname == 'layer1'){
            outerradius =  eduPie.radius;
            innerradius = eduPie.radius/2;
        } else {
            outerradius =  eduPie.radius*1.5;
            innerradius = eduPie.radius;
        }
        var arc = eduPie.createArc(outerradius,innerradius);
        this.chart.selectAll('.'+classname)
        .attr('d',arc);
    };
    
    var draw = function(){
        eduPie.calculateScale();
        eduPie.drawPie(eduPie.filterData(eduPie.data.degree,null,'value'),degreeCats,'layer1',categoryColors1,eduPie.radius,eduPie.radius/2);
        eduPie.updatePie('layer1',eduPie.data.degree,eduPie.radius,eduPie.radius/2);
        eduPie.drawPie(eduPie.filterData(eduPie.data.major,null,'value'),majorCats,'layer2',categoryColors2,eduPie.radius*1.5,eduPie.radius);
        eduPie.updatePie('layer2',eduPie.data.major,eduPie.radius*1.5,eduPie.radius);        
    };
    var resize = function(){
        eduPie.calculateScale();
        eduPie.resizePie('layer1');
        eduPie.resizePie('layer2');
    }; 

    draw();
    d3.select('#'+eduPie.id+' .loader').remove();
    resizes.push(resize);
}