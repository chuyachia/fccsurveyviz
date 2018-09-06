import {arc,pie,scaleOrdinal} from 'd3';

export default {
  createArc : function(radius,innerradius){
    innerradius = (typeof innerradius =='undefined')?0:innerradius;
    return arc()
    .outerRadius(radius)
    .innerRadius(innerradius);
  },
  createPie: function(callback){
    return pie()
    .sort(null)
    .value(callback);
  },
  createColor:function(domain, range){
    return scaleOrdinal()
    .domain(domain)
    .range(range);
  }
};