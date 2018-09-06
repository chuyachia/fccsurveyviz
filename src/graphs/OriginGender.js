import Graph from '../components/Graph';
import Pie from '../components/Pie';
import palette from 'google-palette';
import * as d3 from "d3";

export default function(data){
    var sequenceColors=palette('cb-Blues',4);
    var categoryColors = ['rgb(116, 196, 118)','rgb(107, 174, 214)','rgb(253, 141, 60)'];

    var countryData = data;
    var Map = Object.assign({},Graph,Pie, {data:countryData,w:1000,h:400,title:"Country",radius:50,id:'origin-gender'});
    
    Map.projection = d3.geoMercator()
    .scale(Map.innerWidth() / 2 / Math.PI)
    .translate([Map.innerWidth() / 2, Map.innerHeight() /2]);

    Map.path = d3.geoPath()
      .projection(Map.projection);
    Map.mapPalette = [{value:100,color:sequenceColors[0]},
                      {value:500,color:sequenceColors[1]},{value:1000,color:sequenceColors[2]},{value:2000,color:sequenceColors[3]}];
    Map.piePalette = [{value:'female',color:categoryColors[0]},{value:'male',color:categoryColors[1]},{value:'other',color:categoryColors[2]}];
    
    Map.color = d3.scaleThreshold()
    .domain(Map.mapPalette.map(function(e){return e.value}))
    .range(Map.mapPalette.map(function(e){return e.color}));


    Map.piecolor = Map.createColor(Map.piePalette.map(function(e){return e.value}),Map.piePalette.map(function(e){return e.color}));
    Map.arc = Map.createArc(Map.radius);
    Map.pie = Map.createPie(function(d) { return d.count; });
    Map.createChart();
    d3.json('https://cdn.glitch.com/65fc4036-c50a-4243-9aec-c7cf33c51c9c%2Fworld_countries.json?1535668591645')
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
      
      
      Map.chart.selectAll(".country")
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('class','country')
      .attr('d', Map.path)
      .on('mouseover',function(d){
        Map.chart
        .append('text')
        .text((d.female+d.male+d.other)+" coder(s) in " + d.properties.name)
        .attr('class','map-text')
        .attr('text-anchor','left')
        .attr('x',Map.radius*2)
        .attr('y',Map.innerHeight());
        
      if ((d.female+d.male+d.other)>0){
       var pie=  Map.chart
          .selectAll(".pie")
          .data(Map.pie([{gender:Map.piePalette[0].value,count:d.female,color:Map.piePalette[0].color},
                         {gender:Map.piePalette[1].value,count:d.male,color:Map.piePalette[1].color},
                         {gender:Map.piePalette[2].value,count:d.other,color:Map.piePalette[2].color}]))
          .enter()
          .append("g")
          .attr("class", "pie")
          .attr('transform','translate(0,'+Map.innerHeight()+')');
        
          pie.append("path")
          .style('fill',function(d){return Map.piecolor(d.data.gender)})
          .attr("d", Map.arc);

          var legend = pie.append('g')
          .attr('transform',function(d,i){
              return 'translate('+(-50+i*60)+','+(-Map.radius-10)+')';
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
        d3.selectAll('.map-text').remove();
        d3.selectAll('.pie').remove();
      })
      .style('fill','grey')
      .transition()
      .duration(3000)
      .style('fill', function(d) { return Map.color(d.female+d.male+d.other)});

      var legend = Map.chart.selectAll('.legend')
      .data(Map.mapPalette)
      .enter()
      .append('g')
      .attr('class','legend')
      .attr('transform',function(d,i){
          return 'translate('+(Map.innerWidth()-50)+','+(Map.innerHeight()/2+i*20)+')';
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


    })
    .catch(function(err){
        console.log(err);
    });
    
    d3.select('#'+Map.id+' .loader').remove();
    
}