import Graph from '../components/Graph';
import * as d3 from "d3";

export default function(data){
    var ageData = data;
    var ageHist = Object.assign({},Graph,{rawdata:ageData,data:ageData,title:"Demography",id:"age-gender"});
    
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
    
    ageHist.updateBars = function(){
      var bars = this.chart.selectAll('.age-bar')
      .data(this.bins);
       bars.exit()
         .remove(); 
       bars.enter()
        .append('g')
        .attr('class','age-bar')
        .on('mouseover',function(d){
            d3.select(this)
            .append('text')
            .attr('class','age-text')
            .attr('x',()=>this.innerWidth())
            .attr('text-anchor','end')
            .text(d.length+" coders aged between "+d.x0+" and "+d.x1);
        })
        .on('mouseout',function(){
            d3.selectAll('.age-text')
            .remove();
        });
      
      var rect = this.chart.selectAll('rect')
        .data(this.bins);
 
       rect.exit()
         .remove(); 
      
       rect.enter()
        .append('rect')
        .style('fill','2171b5')
        .attr("x", (d) => this.xscale(d.x0))
        .attr('width',(d)=> this.xscale(d.x1)-this.xscale(d.x0)-1)
        .attr("y",()=> this.innerHeight())
        .attr('height',0);

       rect.transition()
        .duration(1000)
        .attr("y",(d)=> this.yscale(d.length))
        .attr('height',(d)=>this.innerHeight()-this.yscale(d.length));
      };
    
    
    ageHist.xscale = d3.scaleLinear()
      .domain([d3.min(ageHist.data,function(d){return d.age}),d3.max(ageHist.data,function(d){return d.age})])
      .range([0,ageHist.innerWidth()]);
    ageHist.hist = d3.histogram()
      .value(function(d){return d.age})
      .domain(ageHist.xscale.domain());
    ageHist.convertBins();
    ageHist.yscale = d3.scaleLinear()
      .domain([0,d3.max(ageHist.bins,function(d){return d.length})])
      .range([ageHist.innerHeight(),0]);
    
    ageHist.createChart();
    ageHist.chart.selectAll('.age-bar')
      .data(ageHist.bins)
      .enter()
      .append('g')
      .attr('class','age-bar')
      .on('mouseover',function(d){
          d3.select(this)
          .append('text')
          .attr('class','age-text')
          .attr('x',ageHist.innerWidth())
          .attr('text-anchor','end')
          .text(d.length+" coders aged between "+d.x0+" and "+d.x1);
      })
      .on('mouseout',function(){
          d3.selectAll('.age-text')
          .remove();
      })
      .append('rect')
      .style('fill','2171b5')
      .attr("x", function(d){return ageHist.xscale(d.x0)})
      .attr('width',function(d){return ageHist.xscale(d.x1)-ageHist.xscale(d.x0)-1})
      .attr("y",ageHist.innerHeight())
      .attr('height',0)
      .transition()
      .duration(3000)
      .attr("y",function(d){return ageHist.yscale(d.length)})
      .attr('height',function(d){return ageHist.innerHeight()-ageHist.yscale(d.length)});   

    
    d3.select('figure')
    .append('select')
    .on('change',function(){
      var selected = d3.select('select').property('value');
      ageHist.filterData(selected);
      ageHist.convertBins();
      ageHist.updateBars();
    })
    .selectAll('option')
    .data(['all','female','male'])
    .enter()
    .append('option')
    .attr('value',function(d){return d})
    .text(function(d){return d});
    
    ageHist.chart.append('g')
    .attr('transform','translate(0,'+ageHist.innerHeight()+')')
    .call(d3.axisBottom(ageHist.xscale));
    
    ageHist.chart.append('g')
    .call(d3.axisLeft(ageHist.yscale));
    
    ageHist.chart.append('text')
    .text('Age')
    .attr('transform','translate('+ageHist.innerWidth()/2+','+(ageHist.innerHeight()+30)+')')
    .attr('text-anchor','middle');
    
    ageHist.chart.append('text')
    .attr("transform", 'rotate(-90)')
    .text('Count')
    .attr('x',0-ageHist.innerHeight()/2)
    .attr('y', 0-40)
    .attr('text-anchor','middle');
    
     d3.select('#'+ageHist.id+' .loader').remove();
    
}