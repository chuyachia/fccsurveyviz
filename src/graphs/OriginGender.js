import Graph from '../components/Graph';
import Pie from '../components/Pie';
import palette from 'google-palette';
import {select,json,scalePow,geoPath,geoMercator,selectAll,axisLeft} from "d3";

export default function(data,resizes){
    var Map = Object.assign({},Graph,Pie, {data:data,title:"Country",margin : {top: 30, right: 30, bottom: 30, left: 30},id:'origin-gender'});
    Map.createChart();
    return json('https://cdn.glitch.com/65fc4036-c50a-4243-9aec-c7cf33c51c9c%2Fworld_countries.json?1535668591645')
    .then(function(geojson) {
      
      var maxCoders= null;
      geojson.features.forEach(function(d) {
        if (Map.data[d.properties.name]){
          d.female = Map.data[d.properties.name]['female'];
          d.male = Map.data[d.properties.name]['male'];
          d.other = Map.data[d.properties.name]['other'];
          var total = d.female+d.male+d.other;
          if (!maxCoders||total>maxCoders)
          maxCoders = total;
        } else {
          d.female = 0;
          d.male=0;
          d.other = 0; 
        }});

      
      
      Map.pie = Map.createPie(function(d) { return d.count; });
      
      Map.buildPalette = function(){
        var seqColors=palette(['cb-Blues'],2);
        var catValues = ['female','male','other'];
        var catColors = ['rgb(116, 196, 118)','rgb(107, 174, 214)','rgb(253, 141, 60)'];     
        this.piePalette = catValues.map(function(d,i){return {value:d,color:catColors[i]}});
        this.mapColor = scalePow()
        .exponent(0.2)
        .domain([0,maxCoders])
        .range(["#"+seqColors[0],"#"+seqColors[1]]);
        this.pieColor = this.createColor(this.piePalette.map(function(e){return e.value}),this.piePalette.map(function(e){return e.color}));
        
        var gradientbar = this.chart.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");
        gradientbar.append("stop")
        .attr("offset", "0%")
        .attr("stop-color","#"+seqColors[0])
        .attr("stop-opacity", 1);
        gradientbar.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#"+seqColors[1])
        .attr("stop-opacity", 1);      
      };
  
      Map.calculateScale= function(){
        this.width = this.innerWidth();
        this.height = this.innerHeight();
        this.radius = this.width/9;
        this.arc = this.createArc(this.radius);
        this.projection = geoMercator()
        //.fitSize([this.width, this.outerHeight()], geojson);
        .scale(this.width /7.5)
        .translate([this.width/2, this.height/2]);      
        this.path = geoPath()
          .projection(this.projection);
        this.legendScale = scalePow()
        .exponent(0.2)
        .domain([0,maxCoders])
        .range([this.outerHeight()-this.margin.top,0])
        .nice();
      };
      
      Map.drawMap = function(){
        this.chart.selectAll(".country")
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('class','country')
        .attr('d', this.path)
        .on('mouseover',function(d){
          var total = d.female+d.male+d.other;
          select(this)
            .attr('opacity','0.8');
          Map.chart
          .append('text')
          .text(total+" coder(s) in " + d.properties.name)
          .attr('class','map-text')
          .attr('text-anchor','left')
          .attr('x',Map.radius*2)
          .attr('y',Map.height);
        
          var pointerHeight = Map.legendScale(total);
          var pointerWidth= Map.outerWidth();
          var pointerSide = pointerWidth/75;
          select('#'+Map.id+' svg')
          .append('polygon')
          .attr('class','pointer')
          .attr('points',(pointerWidth+pointerSide*Math.sin(45))+','+(pointerHeight+pointerSide/2)+' '+
          (pointerWidth+pointerSide*Math.sin(45))+','+(pointerHeight-pointerSide/2)+' '+
          (pointerWidth-pointerSide)+','+pointerHeight)
          .attr('transform','translate(0,'+Map.margin.top/2+')');
        
        
        if (total>0){
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
          select(this)
          .attr('opacity','1');
          selectAll('.map-text').remove();
          selectAll('.pie').remove();
          selectAll('.pointer').remove();
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
        select('#'+this.id+' svg')
        .append("g")
        .attr('class','legend-text');
          
        select('#'+this.id+' svg')
        .append("rect")
        .attr('class','legend-bar')
        .style("fill", "url(#gradient)");        
      };
      

      Map.resizeLegend = function(){
        var width= this.outerWidth();
        var height= this.outerHeight();
        var pointerSide = width/75;
        var barWidth = width/50;
        //var ticks = this.legendScale.ticks(5);
        //ticks.push.apply(ticks,[10,50,100,200,300,400,500,750]);
        this.legendAxis = axisLeft()
        .scale(this.legendScale)
        .tickValues([0,10,50,200,500,1000,2000,4000,6000]);
        
        select('#'+this.id+' .legend-text')
        .attr('transform','translate('+(width-barWidth-pointerSide)+','+this.margin.top/2+')')
        .call(this.legendAxis);
        
        select('#'+this.id+' .legend-bar')
        .attr("width", width/50)
        .attr("height", height-this.margin.top)
        .attr('transform','translate('+(width-barWidth-pointerSide)+','+this.margin.top/2+')');
      };
      
      var draw = function(){
        Map.buildPalette();
        Map.calculateScale();
        Map.drawMap();
        Map.drawLegend();
        Map.resizeLegend();
      };
      
      var resize = function(){
        Map.calculateScale();
        Map.resizeMap();
        Map.resizeLegend();
      };
      
      draw();
      select('#'+Map.id+' .loader').remove();
      resizes.push(resize);
    })
    .catch(function(err){
        console.log(err);
    });

}