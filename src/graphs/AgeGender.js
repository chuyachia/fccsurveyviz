import Graph from '../components/Graph';
import * as d3 from "d3";

export default function(data){
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
      .attr("y",()=> this.innerHeight())
      .attr('height',0)
      .style('fill','2171b5')
      .on('mouseover',function(d){
            d3.select(this)
            .attr('opacity','0.8');
        
            ageHist.chart
            .append('text')
            .attr('class','age-text')
            .attr('x',()=>ageHist.innerWidth())
            .attr('text-anchor','end')
            .text(d.length+" coders aged between "+d.x0+" and "+d.x1);
        })
        .on('mouseout',function(){
            d3.select(this)
            .attr('opacity','1');
            d3.selectAll('.age-text')
            .remove();
        })
      .transition()
      .duration(3000)
      .attr("y",(d)=> this.yscale(d.length))
      .attr('height',(d)=>this.innerHeight()-this.yscale(d.length))
      .style('fill','2171b5');
      
       bars
      .transition()
      .duration(3000)
      .attr("y",(d)=> this.yscale(d.length))
      .attr('height',(d)=>this.innerHeight()-this.yscale(d.length))
      .style('fill','2171b5');
      
      bars.exit().remove();
    };

    ageHist.resizeBars = function(){
      this.chart.selectAll('.age-bar')
      .data(this.bins)
      .attr("x", (d) => this.xscale(d.x0))
      .attr('width',(d)=> this.xscale(d.x1)-this.xscale(d.x0)-1);
    };
    
    ageHist.calculateScale = function() {
      this.xscale = d3.scaleLinear()
        .domain([d3.min(ageHist.data,function(d){return d.age}),d3.max(ageHist.data,function(d){return d.age})])
        .range([0,ageHist.innerWidth()]);
      this.hist = d3.histogram()
        .value(function(d){return d.age})
        .domain(ageHist.xscale.domain());
      this.bins = this.hist(this.data);
      this.yscale = d3.scaleLinear()
        .domain([0,d3.max(ageHist.bins,function(d){return d.length})])
        .range([ageHist.innerHeight(),0]);
    };
    
    ageHist.drawAxes= function(){  
       this.chart.select('.xaxis')
        .attr('transform','translate(0,'+ageHist.innerHeight()+')')
        .call(d3.axisBottom(ageHist.xscale));
      
       this.chart.select('.yaxis')
        .call(d3.axisLeft(ageHist.yscale));
      
       this.chart.select('.xaxis-text')
        .attr('transform','translate('+ageHist.innerWidth()/2+','+(ageHist.innerHeight()+30)+')');

      
       this.chart.select('.yaxis-text')
        .attr('x',0-ageHist.innerHeight()/2)
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
    d3.select('figure')
    .append('select')
    .on('change',function(){
      var selected = d3.select('select').property('value');
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
     
     d3.select('#'+ageHist.id+' .loader').remove();
     d3.select(window).on('resize', resize);
    
}