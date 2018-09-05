import {select} from 'd3';

export default {
  chart: null,
  margin : {top: 50, right: 50, bottom: 50, left: 80},
  w:600,
  h:400,
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
    .append('svg')
    .attr('height',this.h)
    .attr('width',this.w)
    .append('g')
    .attr('transform','translate('+this.margin.left+','+this.margin.top+')');
  },
  innerWidth:function(){
    return this.w- this.margin.left-this.margin.right;
  },
  innerHeight:function(){
    return this.h-this.margin.top-this.margin.bottom;
  }
};