import Graph from '../components/Graph';
import {select,event,min,max,scaleLinear,histogram,axisBottom,axisLeft} from "d3";

export default function(data,resizes){
    var ageHist = Object.assign({},Graph,{rawdata:data,data:data,title:"Demography",id:"age-gender"});
    ageHist.createChart();
    ageHist.chart.append('g')
        .attr('class','xaxis');
    ageHist.chart.append('g')
        .attr('class','yaxis');
        
    ageHist.chart.append('text')
        .attr('class','xaxis-text')
        .text('Age')
        .attr('text-anchor','middle');
        
    ageHist.chart.append('text')
        .attr('class','yaxis-text')
        .attr("transform", 'rotate(-90)')
        .text('Count')
        .attr('text-anchor','middle');
    var tooltip = select('#'+ageHist.id).append('div')
    .attr('class','age-tooltip');
    
    var yscaleMax;
        
    ageHist.filterData = function(criteria){
      if (criteria =='female'||criteria =='male'){
        this.data = this.rawdata.filter(function(d){return d.gender==criteria});
      } else {
        this.data = this.rawdata;
      }
    };
    
    ageHist.convertBins= function(){
      this.bins = this.hist(this.data);
    };
    
    ageHist.drawBars = function(){
      var bars = this.chart.selectAll('.age-bar')
      .data(this.bins);
      
      bars.enter()
      .append('rect')
      .attr('class','age-bar')
      .attr("x", (d) => this.xscale(d.x0))
      .attr('width',(d)=> this.xscale(d.x1)-this.xscale(d.x0)-1)
      .attr("y",()=> this.height)
      .attr('height',0)
      .style('fill','rgb(49, 130, 189)')
      .on('mouseover',function(d){
            select(this)
            .attr('opacity','0.8');
        })
        .on('mousemove',function(d){
            tooltip
              .style("left", event.pageX - 50 + "px")
              .style("top", event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html(d.length+" coders aged between "+d.x0+" and "+d.x1);          
        })
        .on('mouseout',function(){
            select(this)
            .attr('opacity','1');
            tooltip.style("display", "none");
        })
      .transition()
      .duration(3000)
      .attr("y",(d)=> this.yscale(d.length))
      .attr('height',(d)=>this.height-this.yscale(d.length))
      .style('fill','rgb(49, 130, 189)');
      
       bars
      .transition()
      .duration(3000)
      .attr("y",(d)=> this.yscale(d.length))
      .attr('height',(d)=>this.height-this.yscale(d.length))
      .style('fill','rgb(49, 130, 189)');
      
      bars.exit().remove();
    };

    ageHist.resizeBars = function(){
      this.chart.selectAll('.age-bar')
      .data(this.bins)
      .attr("x", (d) => this.xscale(d.x0))
      .attr('width',(d)=> this.xscale(d.x1)-this.xscale(d.x0)-1)
      .attr("y",(d)=> this.yscale(d.length))
      .attr('height',(d)=>this.height-this.yscale(d.length));
    };
    
    ageHist.calculateScale = function() {
      this.width = this.innerWidth();
      this.height = this.innerHeight();
      this.xscale = scaleLinear()
        .domain([min(ageHist.data,function(d){return d.age}),max(ageHist.rawdata,function(d){return d.age})])
        .range([0,this.width])
        .nice();
      this.hist = histogram()
        .value(function(d){return d.age})
        .domain(ageHist.xscale.domain());
      this.bins = this.hist(this.data);
      this.yscale = scaleLinear()
        .domain([0,yscaleMax||max(ageHist.bins,function(d){return d.length})])
        .range([this.height,0])
        .nice();
        
      if (!yscaleMax) yscaleMax = max(ageHist.bins,function(d){return d.length});
    };
    
    
    ageHist.drawAxes= function(){  
       this.chart.select('.xaxis')
        .call(axisBottom(this.xscale))
        .attr('transform','translate(0,'+this.height+')');
       this.chart.select('.yaxis')
        .call(axisLeft(this.yscale));
       this.chart.select('.xaxis-text')
        .attr('transform','translate('+this.width/2+','+(this.height+30)+')');
       this.chart.select('.yaxis-text')
        .attr('x',0-this.height/2)
        .attr('y', 0-40);
    };
        

    var draw = function(){
      ageHist.calculateScale();
      ageHist.drawAxes();
      ageHist.drawBars();
    };
    
    var resize = function(){
      ageHist.calculateScale();
      ageHist.drawAxes();      
      ageHist.resizeBars();
    };
      
    draw();
    select('figure')
    .append('select')
    .on('change',function(){
      var selected = select('select').property('value');
      ageHist.filterData(selected);
      ageHist.convertBins();
      ageHist.drawBars();
    })
    .selectAll('option')
    .data(['all','female','male'])
    .enter()
    .append('option')
    .attr('value',function(d){return d})
    .text(function(d){return d});
     
     select('#'+ageHist.id+' .loader').remove();
     
    resizes.push(resize);
}