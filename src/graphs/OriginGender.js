import Graph from '../components/Graph';
import Pie from '../components/Pie';
import palette from 'google-palette';
import * as d3 from "d3";

export default function(data,resizes){
    var Map = Object.assign({},Graph,Pie, {data:data,title:"Country",margin:{top:20,left:20,bottom:20,right:20},id:'origin-gender'});
    Map.createChart();
    return d3.json('https://cdn.glitch.com/65fc4036-c50a-4243-9aec-c7cf33c51c9c%2Fworld_countries.json?1535668591645')
    .then(function(geojson) {
      
      geojson.features.forEach(function(d) {
        if (Map.data[d.properties.name]){
          d.female = Map.data[d.properties.name]['female'];
          d.male = Map.data[d.properties.name]['male'];
          d.other = Map.data[d.properties.name]['other'];
        } else {
          d.female = 0;
          d.male=0;
          d.other = 0; 
        }});

      
      
      Map.pie = Map.createPie(function(d) { return d.count; });
      
      Map.buildPalette = function(){
        var seqValues = [100,500,1000,2000];
        var seqColors=palette(['cb-Blues'],6).slice(2,6);
        var catValues = ['female','male','other'];
        var catColors = ['rgb(116, 196, 118)','rgb(107, 174, 214)','rgb(253, 141, 60)'];     
        this.mapPalette = seqValues.map(function(d,i){return {value:d,color:seqColors[i]}});
        this.piePalette = catValues.map(function(d,i){return {value:d,color:catColors[i]}});
        this.mapColor = d3.scaleThreshold()
          .domain(this.mapPalette.map(function(e){return e.value}))
          .range(this.mapPalette.map(function(e){return e.color}));
        this.pieColor = this.createColor(this.piePalette.map(function(e){return e.value}),this.piePalette.map(function(e){return e.color}));
      };
  
      Map.calculateScale= function(){
        this.width = this.innerWidth();
        this.height = this.innerHeight();
        this.radius = this.width/9;
        this.arc = this.createArc(this.radius);
        this.projection = d3.geoMercator()
        .scale(this.width /1.8/ Math.PI)
        .translate([this.width/2, this.height/2]);      
        this.path = d3.geoPath()
          .projection(this.projection);
      };
      
      Map.drawMap = function(){
        this.chart.selectAll(".country")
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('class','country')
        .attr('d', this.path)
        .on('mouseover',function(d){
          d3.select(this)
            .attr('opacity','0.8');
          Map.chart
          .append('text')
          .text((d.female+d.male+d.other)+" coder(s) in " + d.properties.name)
          .attr('class','map-text')
          .attr('text-anchor','left')
          .attr('x',Map.radius*2)
          .attr('y',Map.height);
          
        if ((d.female+d.male+d.other)>0){
         var pie=  Map.chart
            .selectAll(".pie")
            .data(Map.pie([{gender:Map.piePalette[0].value,count:d.female,color:Map.piePalette[0].color},
                           {gender:Map.piePalette[1].value,count:d.male,color:Map.piePalette[1].color},
                           {gender:Map.piePalette[2].value,count:d.other,color:Map.piePalette[2].color}]))
            .enter()
            .append("g")
            .attr("class", "pie")
            .attr('transform','translate('+Map.radius+','+(Map.height-Map.radius)+')');
            
            pie.append("path")
            .style('fill',function(d){return Map.pieColor(d.data.gender)})
            .attr("d", Map.arc);
  
            var legend = pie.append('g')
            .attr('transform',function(d,i){
                return 'translate('+(-Map.radius+i*60)+','+(-Map.radius-10)+')';
            });
            legend.append('text')
            .text(function(d){return d.data.gender})
            .attr('x',12);
            legend.append('rect')
            .attr('y',-10)
            .attr('height',10)
            .attr('width',10)
            .style('fill',function(d){return d.data.color});
          }
        })
        .on('mouseout',function(){
          d3.select(this)
          .attr('opacity','1');
          d3.selectAll('.map-text').remove();
          d3.selectAll('.pie').remove();
        })
        .style('fill','grey')
        .transition()
        .delay(function(d,i){return i*15})
        .style('fill', function(d) { return Map.mapColor(d.female+d.male+d.other)});
        
      };
      
      Map.resizeMap = function(){
        this.chart.selectAll(".country")
        .attr('d', this.path);
      };

      Map.drawLegend = function(){
        var legend = this.chart.selectAll('.legend')
        .data(this.mapPalette)
        .enter()
        .append('g')
        .attr('class','legend')
        .attr('transform',function(d,i){
              return 'translate('+(Map.width-80)+','+(Map.height*0.75+i*20)+')';
          });
        
        legend.append('text')
        .text(function(d,i){
          if (i ==0)
            return '0-'+d.value;
          else if (i==Map.mapPalette.length-1)
            return Map.mapPalette[i-1].value+' up';
          else
            return Map.mapPalette[i-1].value +'-'+d.value;
        })
        .attr('x',12);
      
        legend.append('rect')
        .attr('y',-10)
        .attr('height',10)
        .attr('width',10)
        .style('fill',function(d){return d.color});
      };
      
      Map.resizeLegend = function(){
          this.chart.selectAll('.legend')
          .data(this.mapPalette)
          .attr('transform',function(d,i){
              return 'translate('+(Map.width-80)+','+(Map.height*0.75+i*20)+')';
          });
      };
      
      var draw = function(){
        Map.buildPalette();
        Map.calculateScale();
        Map.drawMap();
        Map.drawLegend();
      };
      
      var resize = function(){
        Map.calculateScale();
        Map.resizeMap();
        Map.resizeLegend();
      }
      
      draw();
      d3.select('#'+Map.id+' .loader').remove();
      resizes.push(resize);
    })
    .catch(function(err){
        console.log(err);
    });

}