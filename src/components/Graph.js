import {select} from 'd3';

export default {
  height:'500px',
  chart: null,
  margin : {top: 50, right: 50, bottom: 50, left: 50},
  createChart: function(){
    var element = select('main')
    .append('article').attr('id',this.id);
    
    
    element
    .append('h2')
    .text(this.title);
    
    element
    .append('div')
    .attr('class','loader');
    
    this.chart =element.append('figure')
    .style('height',this.height)
    .append('svg')
    .append('g')
    .attr('transform','translate('+this.margin.left+','+this.margin.top+')');
  },
  innerWidth:function(){
    return parseInt(select('#'+this.id+' svg').style("width")) - this.margin.left-this.margin.right;
  },
  innerHeight:function(){
    return parseInt(select('#'+this.id+' svg').style("height"))-this.margin.top-this.margin.bottom;
  }
};