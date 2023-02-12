"use strict";var y=Object.defineProperty,K=Object.defineProperties,j=Object.getOwnPropertyDescriptor,q=Object.getOwnPropertyDescriptors,z=Object.getOwnPropertyNames,w=Object.getOwnPropertySymbols;var C=Object.prototype.hasOwnProperty,J=Object.prototype.propertyIsEnumerable;var P=(e,t,n)=>t in e?y(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,D=(e,t)=>{for(var n in t||={})C.call(t,n)&&P(e,n,t[n]);if(w)for(var n of w(t))J.call(t,n)&&P(e,n,t[n]);return e},_=(e,t)=>K(e,q(t));var Q=(e,t)=>{for(var n in t)y(e,n,{get:t[n],enumerable:!0})},Z=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of z(t))!C.call(e,r)&&r!==n&&y(e,r,{get:()=>t[r],enumerable:!(o=j(t,r))||o.enumerable});return e};var v=e=>Z(y({},"__esModule",{value:!0}),e);var ct={};Q(ct,{convert:()=>m,getInterface:()=>it,pick:()=>rt});module.exports=v(ct);var tt=e=>Array.isArray(e)?e.filter(Boolean):[],et=e=>/^\w*$/.test(e),nt=e=>tt(e.replace(/["|']|\]/g,"").split(/\.|\[/)),M=e=>e==null,S=e=>Boolean(e)&&typeof e=="object",c=e=>e===void 0,a=()=>{},U=(e,t)=>e&&e.constructor&&e.constructor.name===t,g=(e,t,n)=>{let o=-1,r=et(t)?[t]:nt(t),s=r.length,p=s-1;for(;++o<s;){let d=r[o],f=n;if(o!==p){let u=e[d];f=S(u)||Array.isArray(u)?u:isNaN(+r[o+1])?{}:[]}e[d]=f,e=e[d]}return e},W=(e,t,n)=>{if(!t||!S(e))return n;let r=t.split(/[,[\].]+?/).filter(Boolean).reduce((s,p)=>M(s)?s:s[p],e);return c(r)||r===e?c(e[t])?n:e[t]:r},i={DEFAULT:"DEFAULT",APPLY:"APPLY",MAP:"MAP",MAP_WHEN:"MAP_WHEN",SWITCH:"SWITCH",SWITCH_MAP:"SWITCH_MAP",REDUCE:"REDUCE"};var I=(e,t)=>c(t)?e.fallback():t;var O=(e,t)=>m(e.childSchema,t);var H=(e,t)=>{let n=t==null?void 0:t.map(o=>m(e.childSchema,o));return c(n)?e.fallback():n};var R=(e,t)=>{let n=(t!=null?t:[]).reduce((o,r)=>e.predicate(r)?[...o,m(e.childSchema,r)]:o,[]);return c(n)||!n.length?e.fallback():n};var N=(e,t)=>{let n=e.predicate(t),o=e.switchMap[n],r=o?m(o,t):void 0;return c(r)?e.fallback():r};var F=(e,t)=>{let n=t==null?void 0:t.reduce((o,r)=>{var f;let s=e.predicate(r),p=(f=e.switchMap)==null?void 0:f[s];return!!p?[...o,m(p,r)]:o},[]);return c(n)||!n.length?e.fallback():n};var b=(e,t)=>t==null?void 0:t.reduce((n,o)=>_(D({},n),{[e.predicate(o)]:m(e.childSchema,o)}),{});var L={[i.DEFAULT]:I,[i.APPLY]:O,[i.MAP]:H,[i.MAP_WHEN]:R,[i.SWITCH]:N,[i.SWITCH_MAP]:F,[i.REDUCE]:b};var $="__EXTENDS__",ot={[$]:{type:"extends",optional:!1,child:null}},k=e=>{var n,o;let t={};for(let r of Object.keys(e))r.startsWith("...")?Object.assign(t,ot):g(t,r,(o=(n=e[r])==null?void 0:n.scope)==null?void 0:o.getTypeDefinition());return t};function B(e){let{type:t,mode:n}=e;return t===String?"string":t===Number?"number":t===Boolean?"boolean":n===i.MAP||n===i.MAP_WHEN||n===i.SWITCH_MAP?"array":n===i.APPLY||n===i.SWITCH?"object":n===i.REDUCE?"record":"unknown"}function V(e){let{mode:t,switchMap:n,childSchema:o}=e;return i.DEFAULT===t?null:t===i.SWITCH||t===i.SWITCH_MAP?Object.values(n).map(r=>k(r)):k(o)}function Y(e){let t=k(e);return["interface Schema",l(t)].join(`
`)}function l(e){var n;let t=["{"];for(let o of Object.keys(e)){let{type:r,optional:s,child:p}=(n=e[o])!=null?n:{},d=`"${o}"`,f=s||!r?"?:":":",u=Array.isArray(p)?p.map(T=>l(T)).join("|"):"",X=";",A=T=>`Array<${T}>`,G=T=>`Record<string, ${T}>`,h=r;if(o===$){t.push("[property: string]: any");continue}c(e[o])&&(h="any"),e[o]&&!r&&(h=l(e[o])),r==="object"&&(Array.isArray(p)?h=u:h=l(p)),r==="array"&&(Array.isArray(p)?h=A(u):h=A(l(p))),r==="record"&&(h=G(l(p))),t.push(`${d}${f}${h}${X}`)}return t.push("}"),t.join(`
`)}var E=class{constructor(){this.mode=i.DEFAULT,this.keys=[],this.actions=[],this.fallback=a,this.childSchema=void 0,this.switchMap={},this.predicate=a,this.type=void 0}withActions(t){return this.actions.reduce((n,o)=>[o(...n)],t)[0]}getTypeDefinition(){return{type:B(this),optional:this.fallback===a,child:V(this)}}};var x=class{constructor(t=[]){this.scope=new E,this.scope.keys=t}type(t){return this.scope.type=t,this}pipe(...t){return this.scope.actions.push(...t),this}fallback(t){return this.scope.fallback=typeof t=="function"?t:()=>t,this}apply(t){return this.scope.childSchema=t,this.scope.mode=i.APPLY,this}map(t){return this.scope.childSchema=t,this.scope.mode=i.MAP,this}mapWhen(t,n=a){return this.scope.childSchema=t,this.scope.predicate=n,this.scope.mode=i.MAP_WHEN,this}switch(t,n=a){return this.scope.switchMap=t,this.scope.predicate=n,this.scope.mode=i.SWITCH,this}switchMap(t,n=a){return this.scope.switchMap=t,this.scope.predicate=n,this.scope.mode=i.SWITCH_MAP,this}reduce(t=a,n){return this.scope.predicate=t,this.scope.childSchema=n,this.scope.mode=i.REDUCE,this}_setDestination(t){return this.scope.keys.length||(this.scope.keys=[t]),this}_execute(t){let n=this.scope.keys.map(s=>W(t,s,void 0)),o=L[this.scope.mode](this.scope,this.scope.withActions(n)),r=c(this.scope.type)||M(o)?o:this.scope.type(o);return Number.isNaN(r)?void 0:r}};var m=(e,t)=>{S(t)||(t={});let n={};for(let[o,r]of Object.entries(e)){let s=U(r,"FieldMapper")?r._setDestination(o)._execute(t):r;c(s)||(o.startsWith("...")?Object.assign(n,s):g(n,o,s))}return n},rt=(...e)=>new x(e),it=Y;0&&(module.exports={convert,getInterface,pick});
