import {arc,pie,scaleOrdinal} from 'd3';

export default {
  createArc : function(radius,innerradius){
    innerradius = (typeof innerradius =='undefined')?0:innerradius;
    this.arc = arc()
    .outerRadius(radius)
    .innerRadius(innerradius);
  },
  createPie: function(callback){
    this.pie = pie()
    .sort(null)
    .value(callback);
  },
  createColor:function(domain, range){
    this.piecolor= scaleOrdinal()
    .domain(domain)
    .range(range);
  }
};