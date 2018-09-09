import {select} from 'd3';

export default {
  containerHeight:'500px',
  chart: null,
  margin : {top: 60, right: 60, bottom: 60, left: 60},
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
    //.style('height',this.containerHeight)
    .append('svg')
    .append('g')
    .attr('transform','translate('+this.margin.left+','+this.margin.top+')');
  },
  outerHeight :function(){
     return parseInt(select('#'+this.id+' svg').style("height"));
  },
  outerWidth: function(){
    return parseInt(select('#'+this.id+' svg').style("width"));
  },
  innerWidth:function(){
    return parseInt(select('#'+this.id+' svg').style("width")) - this.margin.left-this.margin.right;
  },
  innerHeight:function(){
    return parseInt(select('#'+this.id+' svg').style("height"))-this.margin.top-this.margin.bottom;
  }
};