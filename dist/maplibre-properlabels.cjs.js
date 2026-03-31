"use strict";const ln=23283064365386963e-26,Tn=12,un=typeof TextDecoder>"u"?null:new TextDecoder("utf-8"),Z=0,K=1,j=2,$=5;class Nn{constructor(n=new Uint8Array(16)){this.buf=ArrayBuffer.isView(n)?n:new Uint8Array(n),this.dataView=new DataView(this.buf.buffer),this.pos=0,this.type=0,this.length=this.buf.length}readFields(n,e,s=this.length){for(;this.pos<s;){const i=this.readVarint(),u=i>>3,l=this.pos;this.type=i&7,n(u,e,this),this.pos===l&&this.skip(i)}return e}readMessage(n,e){return this.readFields(n,e,this.readVarint()+this.pos)}readFixed32(){const n=this.dataView.getUint32(this.pos,!0);return this.pos+=4,n}readSFixed32(){const n=this.dataView.getInt32(this.pos,!0);return this.pos+=4,n}readFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getUint32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readSFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getInt32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readFloat(){const n=this.dataView.getFloat32(this.pos,!0);return this.pos+=4,n}readDouble(){const n=this.dataView.getFloat64(this.pos,!0);return this.pos+=8,n}readVarint(n){const e=this.buf;let s,i;return i=e[this.pos++],s=i&127,i<128||(i=e[this.pos++],s|=(i&127)<<7,i<128)||(i=e[this.pos++],s|=(i&127)<<14,i<128)||(i=e[this.pos++],s|=(i&127)<<21,i<128)?s:(i=e[this.pos],s|=(i&15)<<28,Bn(s,n,this))}readVarint64(){return this.readVarint(!0)}readSVarint(){const n=this.readVarint();return n%2===1?(n+1)/-2:n/2}readBoolean(){return!!this.readVarint()}readString(){const n=this.readVarint()+this.pos,e=this.pos;return this.pos=n,n-e>=Tn&&un?un.decode(this.buf.subarray(e,n)):Kn(this.buf,e,n)}readBytes(){const n=this.readVarint()+this.pos,e=this.buf.subarray(this.pos,n);return this.pos=n,e}readPackedVarint(n=[],e){const s=this.readPackedEnd();for(;this.pos<s;)n.push(this.readVarint(e));return n}readPackedSVarint(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSVarint());return n}readPackedBoolean(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readBoolean());return n}readPackedFloat(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFloat());return n}readPackedDouble(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readDouble());return n}readPackedFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed32());return n}readPackedSFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed32());return n}readPackedFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed64());return n}readPackedSFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed64());return n}readPackedEnd(){return this.type===j?this.readVarint()+this.pos:this.pos+1}skip(n){const e=n&7;if(e===Z)for(;this.buf[this.pos++]>127;);else if(e===j)this.pos=this.readVarint()+this.pos;else if(e===$)this.pos+=4;else if(e===K)this.pos+=8;else throw new Error(`Unimplemented type: ${e}`)}writeTag(n,e){this.writeVarint(n<<3|e)}realloc(n){let e=this.length||16;for(;e<this.pos+n;)e*=2;if(e!==this.length){const s=new Uint8Array(e);s.set(this.buf),this.buf=s,this.dataView=new DataView(s.buffer),this.length=e}}finish(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)}writeFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeSFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*ln),!0),this.pos+=8}writeSFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*ln),!0),this.pos+=8}writeVarint(n){if(n=+n||0,n>268435455||n<0){On(n,this);return}this.realloc(4),this.buf[this.pos++]=n&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=n>>>7&127)))}writeSVarint(n){this.writeVarint(n<0?-n*2-1:n*2)}writeBoolean(n){this.writeVarint(+n)}writeString(n){n=String(n),this.realloc(n.length*4),this.pos++;const e=this.pos;this.pos=$n(this.buf,n,this.pos);const s=this.pos-e;s>=128&&hn(e,s,this),this.pos=e-1,this.writeVarint(s),this.pos+=s}writeFloat(n){this.realloc(4),this.dataView.setFloat32(this.pos,n,!0),this.pos+=4}writeDouble(n){this.realloc(8),this.dataView.setFloat64(this.pos,n,!0),this.pos+=8}writeBytes(n){const e=n.length;this.writeVarint(e),this.realloc(e);for(let s=0;s<e;s++)this.buf[this.pos++]=n[s]}writeRawMessage(n,e){this.pos++;const s=this.pos;n(e,this);const i=this.pos-s;i>=128&&hn(s,i,this),this.pos=s-1,this.writeVarint(i),this.pos+=i}writeMessage(n,e,s){this.writeTag(n,j),this.writeRawMessage(e,s)}writePackedVarint(n,e){e.length&&this.writeMessage(n,Vn,e)}writePackedSVarint(n,e){e.length&&this.writeMessage(n,In,e)}writePackedBoolean(n,e){e.length&&this.writeMessage(n,Un,e)}writePackedFloat(n,e){e.length&&this.writeMessage(n,Gn,e)}writePackedDouble(n,e){e.length&&this.writeMessage(n,Dn,e)}writePackedFixed32(n,e){e.length&&this.writeMessage(n,qn,e)}writePackedSFixed32(n,e){e.length&&this.writeMessage(n,Hn,e)}writePackedFixed64(n,e){e.length&&this.writeMessage(n,jn,e)}writePackedSFixed64(n,e){e.length&&this.writeMessage(n,zn,e)}writeBytesField(n,e){this.writeTag(n,j),this.writeBytes(e)}writeFixed32Field(n,e){this.writeTag(n,$),this.writeFixed32(e)}writeSFixed32Field(n,e){this.writeTag(n,$),this.writeSFixed32(e)}writeFixed64Field(n,e){this.writeTag(n,K),this.writeFixed64(e)}writeSFixed64Field(n,e){this.writeTag(n,K),this.writeSFixed64(e)}writeVarintField(n,e){this.writeTag(n,Z),this.writeVarint(e)}writeSVarintField(n,e){this.writeTag(n,Z),this.writeSVarint(e)}writeStringField(n,e){this.writeTag(n,j),this.writeString(e)}writeFloatField(n,e){this.writeTag(n,$),this.writeFloat(e)}writeDoubleField(n,e){this.writeTag(n,K),this.writeDouble(e)}writeBooleanField(n,e){this.writeVarintField(n,+e)}}function Bn(r,n,e){const s=e.buf;let i,u;if(u=s[e.pos++],i=(u&112)>>4,u<128||(u=s[e.pos++],i|=(u&127)<<3,u<128)||(u=s[e.pos++],i|=(u&127)<<10,u<128)||(u=s[e.pos++],i|=(u&127)<<17,u<128)||(u=s[e.pos++],i|=(u&127)<<24,u<128)||(u=s[e.pos++],i|=(u&1)<<31,u<128))return q(r,i,n);throw new Error("Expected varint not more than 10 bytes")}function q(r,n,e){return e?n*4294967296+(r>>>0):(n>>>0)*4294967296+(r>>>0)}function On(r,n){let e,s;if(r>=0?(e=r%4294967296|0,s=r/4294967296|0):(e=~(-r%4294967296),s=~(-r/4294967296),e^4294967295?e=e+1|0:(e=0,s=s+1|0)),r>=18446744073709552e3||r<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");n.realloc(10),Rn(e,s,n),Cn(s,n)}function Rn(r,n,e){e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos]=r&127}function Cn(r,n){const e=(r&7)<<4;n.buf[n.pos++]|=e|((r>>>=3)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127)))))}function hn(r,n,e){const s=n<=16383?1:n<=2097151?2:n<=268435455?3:Math.floor(Math.log(n)/(Math.LN2*7));e.realloc(s);for(let i=e.pos-1;i>=r;i--)e.buf[i+s]=e.buf[i]}function Vn(r,n){for(let e=0;e<r.length;e++)n.writeVarint(r[e])}function In(r,n){for(let e=0;e<r.length;e++)n.writeSVarint(r[e])}function Gn(r,n){for(let e=0;e<r.length;e++)n.writeFloat(r[e])}function Dn(r,n){for(let e=0;e<r.length;e++)n.writeDouble(r[e])}function Un(r,n){for(let e=0;e<r.length;e++)n.writeBoolean(r[e])}function qn(r,n){for(let e=0;e<r.length;e++)n.writeFixed32(r[e])}function Hn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed32(r[e])}function jn(r,n){for(let e=0;e<r.length;e++)n.writeFixed64(r[e])}function zn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed64(r[e])}function Kn(r,n,e){let s="",i=n;for(;i<e;){const u=r[i];let l=null,c=u>239?4:u>223?3:u>191?2:1;if(i+c>e)break;let d,g,x;c===1?u<128&&(l=u):c===2?(d=r[i+1],(d&192)===128&&(l=(u&31)<<6|d&63,l<=127&&(l=null))):c===3?(d=r[i+1],g=r[i+2],(d&192)===128&&(g&192)===128&&(l=(u&15)<<12|(d&63)<<6|g&63,(l<=2047||l>=55296&&l<=57343)&&(l=null))):c===4&&(d=r[i+1],g=r[i+2],x=r[i+3],(d&192)===128&&(g&192)===128&&(x&192)===128&&(l=(u&15)<<18|(d&63)<<12|(g&63)<<6|x&63,(l<=65535||l>=1114112)&&(l=null))),l===null?(l=65533,c=1):l>65535&&(l-=65536,s+=String.fromCharCode(l>>>10&1023|55296),l=56320|l&1023),s+=String.fromCharCode(l),i+=c}return s}function $n(r,n,e){for(let s=0,i,u;s<n.length;s++){if(i=n.charCodeAt(s),i>55295&&i<57344)if(u)if(i<56320){r[e++]=239,r[e++]=191,r[e++]=189,u=i;continue}else i=u-55296<<10|i-56320|65536,u=null;else{i>56319||s+1===n.length?(r[e++]=239,r[e++]=191,r[e++]=189):u=i;continue}else u&&(r[e++]=239,r[e++]=191,r[e++]=189,u=null);i<128?r[e++]=i:(i<2048?r[e++]=i>>6|192:(i<65536?r[e++]=i>>12|224:(r[e++]=i>>18|240,r[e++]=i>>12&63|128),r[e++]=i>>6&63|128),r[e++]=i&63|128)}return e}function C(r,n){this.x=r,this.y=n}C.prototype={clone(){return new C(this.x,this.y)},add(r){return this.clone()._add(r)},sub(r){return this.clone()._sub(r)},multByPoint(r){return this.clone()._multByPoint(r)},divByPoint(r){return this.clone()._divByPoint(r)},mult(r){return this.clone()._mult(r)},div(r){return this.clone()._div(r)},rotate(r){return this.clone()._rotate(r)},rotateAround(r,n){return this.clone()._rotateAround(r,n)},matMult(r){return this.clone()._matMult(r)},unit(){return this.clone()._unit()},perp(){return this.clone()._perp()},round(){return this.clone()._round()},mag(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals(r){return this.x===r.x&&this.y===r.y},dist(r){return Math.sqrt(this.distSqr(r))},distSqr(r){const n=r.x-this.x,e=r.y-this.y;return n*n+e*e},angle(){return Math.atan2(this.y,this.x)},angleTo(r){return Math.atan2(this.y-r.y,this.x-r.x)},angleWith(r){return this.angleWithSep(r.x,r.y)},angleWithSep(r,n){return Math.atan2(this.x*n-this.y*r,this.x*r+this.y*n)},_matMult(r){const n=r[0]*this.x+r[1]*this.y,e=r[2]*this.x+r[3]*this.y;return this.x=n,this.y=e,this},_add(r){return this.x+=r.x,this.y+=r.y,this},_sub(r){return this.x-=r.x,this.y-=r.y,this},_mult(r){return this.x*=r,this.y*=r,this},_div(r){return this.x/=r,this.y/=r,this},_multByPoint(r){return this.x*=r.x,this.y*=r.y,this},_divByPoint(r){return this.x/=r.x,this.y/=r.y,this},_unit(){return this._div(this.mag()),this},_perp(){const r=this.y;return this.y=this.x,this.x=-r,this},_rotate(r){const n=Math.cos(r),e=Math.sin(r),s=n*this.x-e*this.y,i=e*this.x+n*this.y;return this.x=s,this.y=i,this},_rotateAround(r,n){const e=Math.cos(r),s=Math.sin(r),i=n.x+e*(this.x-n.x)-s*(this.y-n.y),u=n.y+s*(this.x-n.x)+e*(this.y-n.y);return this.x=i,this.y=u,this},_round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},constructor:C};C.convert=function(r){if(r instanceof C)return r;if(Array.isArray(r))return new C(+r[0],+r[1]);if(r.x!==void 0&&r.y!==void 0)return new C(+r.x,+r.y);throw new Error("Expected [x, y] or {x, y} point format")};class Fn{constructor(n,e,s,i,u){this.properties={},this.extent=s,this.type=0,this.id=void 0,this._pbf=n,this._geometry=-1,this._keys=i,this._values=u,n.readFields(Wn,this,e)}loadGeometry(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos,s=[];let i,u=1,l=0,c=0,d=0;for(;n.pos<e;){if(l<=0){const g=n.readVarint();u=g&7,l=g>>3}if(l--,u===1||u===2)c+=n.readSVarint(),d+=n.readSVarint(),u===1&&(i&&s.push(i),i=[]),i&&i.push(new C(c,d));else if(u===7)i&&i.push(i[0].clone());else throw new Error(`unknown command ${u}`)}return i&&s.push(i),s}bbox(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos;let s=1,i=0,u=0,l=0,c=1/0,d=-1/0,g=1/0,x=-1/0;for(;n.pos<e;){if(i<=0){const y=n.readVarint();s=y&7,i=y>>3}if(i--,s===1||s===2)u+=n.readSVarint(),l+=n.readSVarint(),u<c&&(c=u),u>d&&(d=u),l<g&&(g=l),l>x&&(x=l);else if(s!==7)throw new Error(`unknown command ${s}`)}return[c,g,d,x]}toGeoJSON(n,e,s){const i=this.extent*Math.pow(2,s),u=this.extent*n,l=this.extent*e,c=this.loadGeometry();function d(o){return[(o.x+u)*360/i-180,360/Math.PI*Math.atan(Math.exp((1-(o.y+l)*2/i)*Math.PI))-90]}function g(o){return o.map(d)}let x;if(this.type===1){const o=[];for(const p of c)o.push(p[0]);const f=g(o);x=o.length===1?{type:"Point",coordinates:f[0]}:{type:"MultiPoint",coordinates:f}}else if(this.type===2){const o=c.map(g);x=o.length===1?{type:"LineString",coordinates:o[0]}:{type:"MultiLineString",coordinates:o}}else if(this.type===3){const o=Xn(c),f=[];for(const p of o)f.push(p.map(g));x=f.length===1?{type:"Polygon",coordinates:f[0]}:{type:"MultiPolygon",coordinates:f}}else throw new Error("unknown feature type");const y={type:"Feature",geometry:x,properties:this.properties};return this.id!=null&&(y.id=this.id),y}}Fn.types=["Unknown","Point","LineString","Polygon"];function Wn(r,n,e){r===1?n.id=e.readVarint():r===2?Jn(e,n):r===3?n.type=e.readVarint():r===4&&(n._geometry=e.pos)}function Jn(r,n){const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=n._keys[r.readVarint()],i=n._values[r.readVarint()];n.properties[s]=i}}function Xn(r){const n=r.length;if(n<=1)return[r];const e=[];let s,i;for(let u=0;u<n;u++){const l=Yn(r[u]);l!==0&&(i===void 0&&(i=l<0),i===l<0?(s&&e.push(s),s=[r[u]]):s&&s.push(r[u]))}return s&&e.push(s),e}function Yn(r){let n=0;for(let e=0,s=r.length,i=s-1,u,l;e<s;i=e++)u=r[e],l=r[i],n+=(l.x-u.x)*(u.y+l.y);return n}class Zn{constructor(n,e){this.version=1,this.name="",this.extent=4096,this.length=0,this._pbf=n,this._keys=[],this._values=[],this._features=[],n.readFields(Qn,this,e),this.length=this._features.length}feature(n){if(n<0||n>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[n];const e=this._pbf.readVarint()+this._pbf.pos;return new Fn(this._pbf,e,this.extent,this._keys,this._values)}}function Qn(r,n,e){r===15?n.version=e.readVarint():r===1?n.name=e.readString():r===5?n.extent=e.readVarint():r===2?n._features.push(e.pos):r===3?n._keys.push(e.readString()):r===4&&n._values.push(ne(e))}function ne(r){let n=null;const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=r.readVarint()>>3;n=s===1?r.readString():s===2?r.readFloat():s===3?r.readDouble():s===4?r.readVarint64():s===5?r.readVarint():s===6?r.readSVarint():s===7?r.readBoolean():null}if(n==null)throw new Error("unknown feature value");return n}class ee{constructor(n,e){this.layers=n.readFields(te,{},e)}}function te(r,n,e){if(r===3){const s=new Zn(e,e.readVarint()+e.pos);s.length&&(n[s.name]=s)}}function re(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var H={exports:{}},W={};var fn;function ie(){return fn||(fn=1,W.read=function(r,n,e,s,i){var u,l,c=i*8-s-1,d=(1<<c)-1,g=d>>1,x=-7,y=e?i-1:0,o=e?-1:1,f=r[n+y];for(y+=o,u=f&(1<<-x)-1,f>>=-x,x+=c;x>0;u=u*256+r[n+y],y+=o,x-=8);for(l=u&(1<<-x)-1,u>>=-x,x+=s;x>0;l=l*256+r[n+y],y+=o,x-=8);if(u===0)u=1-g;else{if(u===d)return l?NaN:(f?-1:1)*(1/0);l=l+Math.pow(2,s),u=u-g}return(f?-1:1)*l*Math.pow(2,u-s)},W.write=function(r,n,e,s,i,u){var l,c,d,g=u*8-i-1,x=(1<<g)-1,y=x>>1,o=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,f=s?0:u-1,p=s?1:-1,w=n<0||n===0&&1/n<0?1:0;for(n=Math.abs(n),isNaN(n)||n===1/0?(c=isNaN(n)?1:0,l=x):(l=Math.floor(Math.log(n)/Math.LN2),n*(d=Math.pow(2,-l))<1&&(l--,d*=2),l+y>=1?n+=o/d:n+=o*Math.pow(2,1-y),n*d>=2&&(l++,d/=2),l+y>=x?(c=0,l=x):l+y>=1?(c=(n*d-1)*Math.pow(2,i),l=l+y):(c=n*Math.pow(2,y-1)*Math.pow(2,i),l=0));i>=8;r[e+f]=c&255,f+=p,c/=256,i-=8);for(l=l<<i|c,g+=i;g>0;r[e+f]=l&255,f+=p,l/=256,g-=8);r[e+f-p]|=w*128}),W}var Q,cn;function se(){if(cn)return Q;cn=1,Q=n;var r=ie();function n(t){this.buf=ArrayBuffer.isView&&ArrayBuffer.isView(t)?t:new Uint8Array(t||0),this.pos=0,this.type=0,this.length=this.buf.length}n.Varint=0,n.Fixed64=1,n.Bytes=2,n.Fixed32=5;var e=65536*65536,s=1/e,i=12,u=typeof TextDecoder>"u"?null:new TextDecoder("utf-8");n.prototype={destroy:function(){this.buf=null},readFields:function(t,a,h){for(h=h||this.length;this.pos<h;){var S=this.readVarint(),v=S>>3,A=this.pos;this.type=S&7,t(v,a,this),this.pos===A&&this.skip(S)}return a},readMessage:function(t,a){return this.readFields(t,a,this.readVarint()+this.pos)},readFixed32:function(){var t=E(this.buf,this.pos);return this.pos+=4,t},readSFixed32:function(){var t=k(this.buf,this.pos);return this.pos+=4,t},readFixed64:function(){var t=E(this.buf,this.pos)+E(this.buf,this.pos+4)*e;return this.pos+=8,t},readSFixed64:function(){var t=E(this.buf,this.pos)+k(this.buf,this.pos+4)*e;return this.pos+=8,t},readFloat:function(){var t=r.read(this.buf,this.pos,!0,23,4);return this.pos+=4,t},readDouble:function(){var t=r.read(this.buf,this.pos,!0,52,8);return this.pos+=8,t},readVarint:function(t){var a=this.buf,h,S;return S=a[this.pos++],h=S&127,S<128||(S=a[this.pos++],h|=(S&127)<<7,S<128)||(S=a[this.pos++],h|=(S&127)<<14,S<128)||(S=a[this.pos++],h|=(S&127)<<21,S<128)?h:(S=a[this.pos],h|=(S&15)<<28,l(h,t,this))},readVarint64:function(){return this.readVarint(!0)},readSVarint:function(){var t=this.readVarint();return t%2===1?(t+1)/-2:t/2},readBoolean:function(){return!!this.readVarint()},readString:function(){var t=this.readVarint()+this.pos,a=this.pos;return this.pos=t,t-a>=i&&u?G(this.buf,a,t):N(this.buf,a,t)},readBytes:function(){var t=this.readVarint()+this.pos,a=this.buf.subarray(this.pos,t);return this.pos=t,a},readPackedVarint:function(t,a){if(this.type!==n.Bytes)return t.push(this.readVarint(a));var h=c(this);for(t=t||[];this.pos<h;)t.push(this.readVarint(a));return t},readPackedSVarint:function(t){if(this.type!==n.Bytes)return t.push(this.readSVarint());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSVarint());return t},readPackedBoolean:function(t){if(this.type!==n.Bytes)return t.push(this.readBoolean());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readBoolean());return t},readPackedFloat:function(t){if(this.type!==n.Bytes)return t.push(this.readFloat());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFloat());return t},readPackedDouble:function(t){if(this.type!==n.Bytes)return t.push(this.readDouble());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readDouble());return t},readPackedFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed32());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFixed32());return t},readPackedSFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed32());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSFixed32());return t},readPackedFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed64());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFixed64());return t},readPackedSFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed64());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSFixed64());return t},skip:function(t){var a=t&7;if(a===n.Varint)for(;this.buf[this.pos++]>127;);else if(a===n.Bytes)this.pos=this.readVarint()+this.pos;else if(a===n.Fixed32)this.pos+=4;else if(a===n.Fixed64)this.pos+=8;else throw new Error("Unimplemented type: "+a)},writeTag:function(t,a){this.writeVarint(t<<3|a)},realloc:function(t){for(var a=this.length||16;a<this.pos+t;)a*=2;if(a!==this.length){var h=new Uint8Array(a);h.set(this.buf),this.buf=h,this.length=a}},finish:function(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)},writeFixed32:function(t){this.realloc(4),M(this.buf,t,this.pos),this.pos+=4},writeSFixed32:function(t){this.realloc(4),M(this.buf,t,this.pos),this.pos+=4},writeFixed64:function(t){this.realloc(8),M(this.buf,t&-1,this.pos),M(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeSFixed64:function(t){this.realloc(8),M(this.buf,t&-1,this.pos),M(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeVarint:function(t){if(t=+t||0,t>268435455||t<0){g(t,this);return}this.realloc(4),this.buf[this.pos++]=t&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=t>>>7&127)))},writeSVarint:function(t){this.writeVarint(t<0?-t*2-1:t*2)},writeBoolean:function(t){this.writeVarint(!!t)},writeString:function(t){t=String(t),this.realloc(t.length*4),this.pos++;var a=this.pos;this.pos=D(this.buf,t,this.pos);var h=this.pos-a;h>=128&&o(a,h,this),this.pos=a-1,this.writeVarint(h),this.pos+=h},writeFloat:function(t){this.realloc(4),r.write(this.buf,t,this.pos,!0,23,4),this.pos+=4},writeDouble:function(t){this.realloc(8),r.write(this.buf,t,this.pos,!0,52,8),this.pos+=8},writeBytes:function(t){var a=t.length;this.writeVarint(a),this.realloc(a);for(var h=0;h<a;h++)this.buf[this.pos++]=t[h]},writeRawMessage:function(t,a){this.pos++;var h=this.pos;t(a,this);var S=this.pos-h;S>=128&&o(h,S,this),this.pos=h-1,this.writeVarint(S),this.pos+=S},writeMessage:function(t,a,h){this.writeTag(t,n.Bytes),this.writeRawMessage(a,h)},writePackedVarint:function(t,a){a.length&&this.writeMessage(t,f,a)},writePackedSVarint:function(t,a){a.length&&this.writeMessage(t,p,a)},writePackedBoolean:function(t,a){a.length&&this.writeMessage(t,b,a)},writePackedFloat:function(t,a){a.length&&this.writeMessage(t,w,a)},writePackedDouble:function(t,a){a.length&&this.writeMessage(t,m,a)},writePackedFixed32:function(t,a){a.length&&this.writeMessage(t,F,a)},writePackedSFixed32:function(t,a){a.length&&this.writeMessage(t,P,a)},writePackedFixed64:function(t,a){a.length&&this.writeMessage(t,_,a)},writePackedSFixed64:function(t,a){a.length&&this.writeMessage(t,L,a)},writeBytesField:function(t,a){this.writeTag(t,n.Bytes),this.writeBytes(a)},writeFixed32Field:function(t,a){this.writeTag(t,n.Fixed32),this.writeFixed32(a)},writeSFixed32Field:function(t,a){this.writeTag(t,n.Fixed32),this.writeSFixed32(a)},writeFixed64Field:function(t,a){this.writeTag(t,n.Fixed64),this.writeFixed64(a)},writeSFixed64Field:function(t,a){this.writeTag(t,n.Fixed64),this.writeSFixed64(a)},writeVarintField:function(t,a){this.writeTag(t,n.Varint),this.writeVarint(a)},writeSVarintField:function(t,a){this.writeTag(t,n.Varint),this.writeSVarint(a)},writeStringField:function(t,a){this.writeTag(t,n.Bytes),this.writeString(a)},writeFloatField:function(t,a){this.writeTag(t,n.Fixed32),this.writeFloat(a)},writeDoubleField:function(t,a){this.writeTag(t,n.Fixed64),this.writeDouble(a)},writeBooleanField:function(t,a){this.writeVarintField(t,!!a)}};function l(t,a,h){var S=h.buf,v,A;if(A=S[h.pos++],v=(A&112)>>4,A<128||(A=S[h.pos++],v|=(A&127)<<3,A<128)||(A=S[h.pos++],v|=(A&127)<<10,A<128)||(A=S[h.pos++],v|=(A&127)<<17,A<128)||(A=S[h.pos++],v|=(A&127)<<24,A<128)||(A=S[h.pos++],v|=(A&1)<<31,A<128))return d(t,v,a);throw new Error("Expected varint not more than 10 bytes")}function c(t){return t.type===n.Bytes?t.readVarint()+t.pos:t.pos+1}function d(t,a,h){return h?a*4294967296+(t>>>0):(a>>>0)*4294967296+(t>>>0)}function g(t,a){var h,S;if(t>=0?(h=t%4294967296|0,S=t/4294967296|0):(h=~(-t%4294967296),S=~(-t/4294967296),h^4294967295?h=h+1|0:(h=0,S=S+1|0)),t>=18446744073709552e3||t<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");a.realloc(10),x(h,S,a),y(S,a)}function x(t,a,h){h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos]=t&127}function y(t,a){var h=(t&7)<<4;a.buf[a.pos++]|=h|((t>>>=3)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127)))))}function o(t,a,h){var S=a<=16383?1:a<=2097151?2:a<=268435455?3:Math.floor(Math.log(a)/(Math.LN2*7));h.realloc(S);for(var v=h.pos-1;v>=t;v--)h.buf[v+S]=h.buf[v]}function f(t,a){for(var h=0;h<t.length;h++)a.writeVarint(t[h])}function p(t,a){for(var h=0;h<t.length;h++)a.writeSVarint(t[h])}function w(t,a){for(var h=0;h<t.length;h++)a.writeFloat(t[h])}function m(t,a){for(var h=0;h<t.length;h++)a.writeDouble(t[h])}function b(t,a){for(var h=0;h<t.length;h++)a.writeBoolean(t[h])}function F(t,a){for(var h=0;h<t.length;h++)a.writeFixed32(t[h])}function P(t,a){for(var h=0;h<t.length;h++)a.writeSFixed32(t[h])}function _(t,a){for(var h=0;h<t.length;h++)a.writeFixed64(t[h])}function L(t,a){for(var h=0;h<t.length;h++)a.writeSFixed64(t[h])}function E(t,a){return(t[a]|t[a+1]<<8|t[a+2]<<16)+t[a+3]*16777216}function M(t,a,h){t[h]=a,t[h+1]=a>>>8,t[h+2]=a>>>16,t[h+3]=a>>>24}function k(t,a){return(t[a]|t[a+1]<<8|t[a+2]<<16)+(t[a+3]<<24)}function N(t,a,h){for(var S="",v=a;v<h;){var A=t[v],T=null,V=A>239?4:A>223?3:A>191?2:1;if(v+V>h)break;var R,U,Y;V===1?A<128&&(T=A):V===2?(R=t[v+1],(R&192)===128&&(T=(A&31)<<6|R&63,T<=127&&(T=null))):V===3?(R=t[v+1],U=t[v+2],(R&192)===128&&(U&192)===128&&(T=(A&15)<<12|(R&63)<<6|U&63,(T<=2047||T>=55296&&T<=57343)&&(T=null))):V===4&&(R=t[v+1],U=t[v+2],Y=t[v+3],(R&192)===128&&(U&192)===128&&(Y&192)===128&&(T=(A&15)<<18|(R&63)<<12|(U&63)<<6|Y&63,(T<=65535||T>=1114112)&&(T=null))),T===null?(T=65533,V=1):T>65535&&(T-=65536,S+=String.fromCharCode(T>>>10&1023|55296),T=56320|T&1023),S+=String.fromCharCode(T),v+=V}return S}function G(t,a,h){return u.decode(t.subarray(a,h))}function D(t,a,h){for(var S=0,v,A;S<a.length;S++){if(v=a.charCodeAt(S),v>55295&&v<57344)if(A)if(v<56320){t[h++]=239,t[h++]=191,t[h++]=189,A=v;continue}else v=A-55296<<10|v-56320|65536,A=null;else{v>56319||S+1===a.length?(t[h++]=239,t[h++]=191,t[h++]=189):A=v;continue}else A&&(t[h++]=239,t[h++]=191,t[h++]=189,A=null);v<128?t[h++]=v:(v<2048?t[h++]=v>>6|192:(v<65536?t[h++]=v>>12|224:(t[h++]=v>>18|240,t[h++]=v>>12&63|128),t[h++]=v>>6&63|128),t[h++]=v&63|128)}return h}return Q}var nn,dn;function _n(){if(dn)return nn;dn=1,nn=r;function r(n,e){this.x=n,this.y=e}return r.prototype={clone:function(){return new r(this.x,this.y)},add:function(n){return this.clone()._add(n)},sub:function(n){return this.clone()._sub(n)},multByPoint:function(n){return this.clone()._multByPoint(n)},divByPoint:function(n){return this.clone()._divByPoint(n)},mult:function(n){return this.clone()._mult(n)},div:function(n){return this.clone()._div(n)},rotate:function(n){return this.clone()._rotate(n)},rotateAround:function(n,e){return this.clone()._rotateAround(n,e)},matMult:function(n){return this.clone()._matMult(n)},unit:function(){return this.clone()._unit()},perp:function(){return this.clone()._perp()},round:function(){return this.clone()._round()},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals:function(n){return this.x===n.x&&this.y===n.y},dist:function(n){return Math.sqrt(this.distSqr(n))},distSqr:function(n){var e=n.x-this.x,s=n.y-this.y;return e*e+s*s},angle:function(){return Math.atan2(this.y,this.x)},angleTo:function(n){return Math.atan2(this.y-n.y,this.x-n.x)},angleWith:function(n){return this.angleWithSep(n.x,n.y)},angleWithSep:function(n,e){return Math.atan2(this.x*e-this.y*n,this.x*n+this.y*e)},_matMult:function(n){var e=n[0]*this.x+n[1]*this.y,s=n[2]*this.x+n[3]*this.y;return this.x=e,this.y=s,this},_add:function(n){return this.x+=n.x,this.y+=n.y,this},_sub:function(n){return this.x-=n.x,this.y-=n.y,this},_mult:function(n){return this.x*=n,this.y*=n,this},_div:function(n){return this.x/=n,this.y/=n,this},_multByPoint:function(n){return this.x*=n.x,this.y*=n.y,this},_divByPoint:function(n){return this.x/=n.x,this.y/=n.y,this},_unit:function(){return this._div(this.mag()),this},_perp:function(){var n=this.y;return this.y=this.x,this.x=-n,this},_rotate:function(n){var e=Math.cos(n),s=Math.sin(n),i=e*this.x-s*this.y,u=s*this.x+e*this.y;return this.x=i,this.y=u,this},_rotateAround:function(n,e){var s=Math.cos(n),i=Math.sin(n),u=e.x+s*(this.x-e.x)-i*(this.y-e.y),l=e.y+i*(this.x-e.x)+s*(this.y-e.y);return this.x=u,this.y=l,this},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},r.convert=function(n){return n instanceof r?n:Array.isArray(n)?new r(n[0],n[1]):n},nn}var z={},en,pn;function En(){if(pn)return en;pn=1;var r=_n();en=n;function n(l,c,d,g,x){this.properties={},this.extent=d,this.type=0,this._pbf=l,this._geometry=-1,this._keys=g,this._values=x,l.readFields(e,this,c)}function e(l,c,d){l==1?c.id=d.readVarint():l==2?s(d,c):l==3?c.type=d.readVarint():l==4&&(c._geometry=d.pos)}function s(l,c){for(var d=l.readVarint()+l.pos;l.pos<d;){var g=c._keys[l.readVarint()],x=c._values[l.readVarint()];c.properties[g]=x}}n.types=["Unknown","Point","LineString","Polygon"],n.prototype.loadGeometry=function(){var l=this._pbf;l.pos=this._geometry;for(var c=l.readVarint()+l.pos,d=1,g=0,x=0,y=0,o=[],f;l.pos<c;){if(g<=0){var p=l.readVarint();d=p&7,g=p>>3}if(g--,d===1||d===2)x+=l.readSVarint(),y+=l.readSVarint(),d===1&&(f&&o.push(f),f=[]),f.push(new r(x,y));else if(d===7)f&&f.push(f[0].clone());else throw new Error("unknown command "+d)}return f&&o.push(f),o},n.prototype.bbox=function(){var l=this._pbf;l.pos=this._geometry;for(var c=l.readVarint()+l.pos,d=1,g=0,x=0,y=0,o=1/0,f=-1/0,p=1/0,w=-1/0;l.pos<c;){if(g<=0){var m=l.readVarint();d=m&7,g=m>>3}if(g--,d===1||d===2)x+=l.readSVarint(),y+=l.readSVarint(),x<o&&(o=x),x>f&&(f=x),y<p&&(p=y),y>w&&(w=y);else if(d!==7)throw new Error("unknown command "+d)}return[o,p,f,w]},n.prototype.toGeoJSON=function(l,c,d){var g=this.extent*Math.pow(2,d),x=this.extent*l,y=this.extent*c,o=this.loadGeometry(),f=n.types[this.type],p,w;function m(P){for(var _=0;_<P.length;_++){var L=P[_],E=180-(L.y+y)*360/g;P[_]=[(L.x+x)*360/g-180,360/Math.PI*Math.atan(Math.exp(E*Math.PI/180))-90]}}switch(this.type){case 1:var b=[];for(p=0;p<o.length;p++)b[p]=o[p][0];o=b,m(o);break;case 2:for(p=0;p<o.length;p++)m(o[p]);break;case 3:for(o=i(o),p=0;p<o.length;p++)for(w=0;w<o[p].length;w++)m(o[p][w]);break}o.length===1?o=o[0]:f="Multi"+f;var F={type:"Feature",geometry:{type:f,coordinates:o},properties:this.properties};return"id"in this&&(F.id=this.id),F};function i(l){var c=l.length;if(c<=1)return[l];for(var d=[],g,x,y=0;y<c;y++){var o=u(l[y]);o!==0&&(x===void 0&&(x=o<0),x===o<0?(g&&d.push(g),g=[l[y]]):g.push(l[y]))}return g&&d.push(g),d}function u(l){for(var c=0,d=0,g=l.length,x=g-1,y,o;d<g;x=d++)y=l[d],o=l[x],c+=(o.x-y.x)*(y.y+o.y);return c}return en}var tn,gn;function Mn(){if(gn)return tn;gn=1;var r=En();tn=n;function n(i,u){this.version=1,this.name=null,this.extent=4096,this.length=0,this._pbf=i,this._keys=[],this._values=[],this._features=[],i.readFields(e,this,u),this.length=this._features.length}function e(i,u,l){i===15?u.version=l.readVarint():i===1?u.name=l.readString():i===5?u.extent=l.readVarint():i===2?u._features.push(l.pos):i===3?u._keys.push(l.readString()):i===4&&u._values.push(s(l))}function s(i){for(var u=null,l=i.readVarint()+i.pos;i.pos<l;){var c=i.readVarint()>>3;u=c===1?i.readString():c===2?i.readFloat():c===3?i.readDouble():c===4?i.readVarint64():c===5?i.readVarint():c===6?i.readSVarint():c===7?i.readBoolean():null}return u}return n.prototype.feature=function(i){if(i<0||i>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[i];var u=this._pbf.readVarint()+this._pbf.pos;return new r(this._pbf,u,this.extent,this._keys,this._values)},tn}var rn,yn;function oe(){if(yn)return rn;yn=1;var r=Mn();rn=n;function n(s,i){this.layers=s.readFields(e,{},i)}function e(s,i,u){if(s===3){var l=new r(u,u.readVarint()+u.pos);l.length&&(i[l.name]=l)}}return rn}var xn;function ae(){return xn||(xn=1,z.VectorTile=oe(),z.VectorTileFeature=En(),z.VectorTileLayer=Mn()),z}var sn,mn;function le(){if(mn)return sn;mn=1;var r=_n(),n=ae().VectorTileFeature;sn=e;function e(i,u){this.options=u||{},this.features=i,this.length=i.length}e.prototype.feature=function(i){return new s(this.features[i],this.options.extent)};function s(i,u){this.id=typeof i.id=="number"?i.id:void 0,this.type=i.type,this.rawGeometry=i.type===1?[i.geometry]:i.geometry,this.properties=i.tags,this.extent=u||4096}return s.prototype.loadGeometry=function(){var i=this.rawGeometry;this.geometry=[];for(var u=0;u<i.length;u++){for(var l=i[u],c=[],d=0;d<l.length;d++)c.push(new r(l[d][0],l[d][1]));this.geometry.push(c)}return this.geometry},s.prototype.bbox=function(){this.geometry||this.loadGeometry();for(var i=this.geometry,u=1/0,l=-1/0,c=1/0,d=-1/0,g=0;g<i.length;g++)for(var x=i[g],y=0;y<x.length;y++){var o=x[y];u=Math.min(u,o.x),l=Math.max(l,o.x),c=Math.min(c,o.y),d=Math.max(d,o.y)}return[u,c,l,d]},s.prototype.toGeoJSON=n.prototype.toGeoJSON,sn}var wn;function ue(){if(wn)return H.exports;wn=1;var r=se(),n=le();H.exports=e,H.exports.fromVectorTileJs=e,H.exports.fromGeojsonVt=s,H.exports.GeoJSONWrapper=n;function e(o){var f=new r;return i(o,f),f.finish()}function s(o,f){f=f||{};var p={};for(var w in o)p[w]=new n(o[w].features,f),p[w].name=w,p[w].version=f.version,p[w].extent=f.extent;return e({layers:p})}function i(o,f){for(var p in o.layers)f.writeMessage(3,u,o.layers[p])}function u(o,f){f.writeVarintField(15,o.version||1),f.writeStringField(1,o.name||""),f.writeVarintField(5,o.extent||4096);var p,w={keys:[],values:[],keycache:{},valuecache:{}};for(p=0;p<o.length;p++)w.feature=o.feature(p),f.writeMessage(2,l,w);var m=w.keys;for(p=0;p<m.length;p++)f.writeStringField(3,m[p]);var b=w.values;for(p=0;p<b.length;p++)f.writeMessage(4,y,b[p])}function l(o,f){var p=o.feature;p.id!==void 0&&f.writeVarintField(1,p.id),f.writeMessage(2,c,o),f.writeVarintField(3,p.type),f.writeMessage(4,x,p)}function c(o,f){var p=o.feature,w=o.keys,m=o.values,b=o.keycache,F=o.valuecache;for(var P in p.properties){var _=p.properties[P],L=b[P];if(_!==null){typeof L>"u"&&(w.push(P),L=w.length-1,b[P]=L),f.writeVarint(L);var E=typeof _;E!=="string"&&E!=="boolean"&&E!=="number"&&(_=JSON.stringify(_));var M=E+":"+_,k=F[M];typeof k>"u"&&(m.push(_),k=m.length-1,F[M]=k),f.writeVarint(k)}}}function d(o,f){return(f<<3)+(o&7)}function g(o){return o<<1^o>>31}function x(o,f){for(var p=o.loadGeometry(),w=o.type,m=0,b=0,F=p.length,P=0;P<F;P++){var _=p[P],L=1;w===1&&(L=_.length),f.writeVarint(d(1,L));for(var E=w===3?_.length-1:_.length,M=0;M<E;M++){M===1&&w!==1&&f.writeVarint(d(2,E-1));var k=_[M].x-m,N=_[M].y-b;f.writeVarint(g(k)),f.writeVarint(g(N)),m+=k,b+=N}w===3&&f.writeVarint(d(7,1))}}function y(o,f){var p=typeof o;p==="string"?f.writeStringField(1,o):p==="boolean"?f.writeBooleanField(7,o):p==="number"&&(o%1!==0?f.writeDoubleField(3,o):o<0?f.writeSVarintField(6,o):f.writeVarintField(5,o))}return H.exports}var he=ue();const bn=re(he),An=`var Yt = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Je = Math.ceil, re = Math.floor, Q = "[BigNumber Error] ", ht = Q + "Number primitive has more than 15 significant digits: ", se = 1e14, G = 14, We = 9007199254740991, Ze = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], ye = 1e7, X = 1e9;
function Bt(t) {
  var e, r, n, i = w.prototype = { constructor: w, toString: null, valueOf: null }, o = new w(1), l = 20, a = 4, h = -7, c = 21, M = -1e7, d = 1e7, P = !1, _ = 1, b = 0, L = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, O = "0123456789abcdefghijklmnopqrstuvwxyz", A = !0;
  function w(s, u) {
    var f, x, p, y, v, g, m, S, E = this;
    if (!(E instanceof w)) return new w(s, u);
    if (u == null) {
      if (s && s._isBigNumber === !0) {
        E.s = s.s, !s.c || s.e > d ? E.c = E.e = null : s.e < M ? E.c = [E.e = 0] : (E.e = s.e, E.c = s.c.slice());
        return;
      }
      if ((g = typeof s == "number") && s * 0 == 0) {
        if (E.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (y = 0, v = s; v >= 10; v /= 10, y++) ;
          y > d ? E.c = E.e = null : (E.e = y, E.c = [s]);
          return;
        }
        S = String(s);
      } else {
        if (!Yt.test(S = String(s))) return n(E, S, g);
        E.s = S.charCodeAt(0) == 45 ? (S = S.slice(1), -1) : 1;
      }
      (y = S.indexOf(".")) > -1 && (S = S.replace(".", "")), (v = S.search(/e/i)) > 0 ? (y < 0 && (y = v), y += +S.slice(v + 1), S = S.substring(0, v)) : y < 0 && (y = S.length);
    } else {
      if (U(u, 2, O.length, "Base"), u == 10 && A)
        return E = new w(s), C(E, l + E.e + 1, a);
      if (S = String(s), g = typeof s == "number") {
        if (s * 0 != 0) return n(E, S, g, u);
        if (E.s = 1 / s < 0 ? (S = S.slice(1), -1) : 1, w.DEBUG && S.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(ht + s);
      } else
        E.s = S.charCodeAt(0) === 45 ? (S = S.slice(1), -1) : 1;
      for (f = O.slice(0, u), y = v = 0, m = S.length; v < m; v++)
        if (f.indexOf(x = S.charAt(v)) < 0) {
          if (x == ".") {
            if (v > y) {
              y = m;
              continue;
            }
          } else if (!p && (S == S.toUpperCase() && (S = S.toLowerCase()) || S == S.toLowerCase() && (S = S.toUpperCase()))) {
            p = !0, v = -1, y = 0;
            continue;
          }
          return n(E, String(s), g, u);
        }
      g = !1, S = r(S, u, 10, E.s), (y = S.indexOf(".")) > -1 ? S = S.replace(".", "") : y = S.length;
    }
    for (v = 0; S.charCodeAt(v) === 48; v++) ;
    for (m = S.length; S.charCodeAt(--m) === 48; ) ;
    if (S = S.slice(v, ++m)) {
      if (m -= v, g && w.DEBUG && m > 15 && (s > We || s !== re(s)))
        throw Error(ht + E.s * s);
      if ((y = y - v - 1) > d)
        E.c = E.e = null;
      else if (y < M)
        E.c = [E.e = 0];
      else {
        if (E.e = y, E.c = [], v = (y + 1) % G, y < 0 && (v += G), v < m) {
          for (v && E.c.push(+S.slice(0, v)), m -= G; v < m; )
            E.c.push(+S.slice(v, v += G));
          v = G - (S = S.slice(v)).length;
        } else
          v -= m;
        for (; v--; S += "0") ;
        E.c.push(+S);
      }
    } else
      E.c = [E.e = 0];
  }
  w.clone = Bt, w.ROUND_UP = 0, w.ROUND_DOWN = 1, w.ROUND_CEIL = 2, w.ROUND_FLOOR = 3, w.ROUND_HALF_UP = 4, w.ROUND_HALF_DOWN = 5, w.ROUND_HALF_EVEN = 6, w.ROUND_HALF_CEIL = 7, w.ROUND_HALF_FLOOR = 8, w.EUCLID = 9, w.config = w.set = function(s) {
    var u, f;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(u = "DECIMAL_PLACES") && (f = s[u], U(f, 0, X, u), l = f), s.hasOwnProperty(u = "ROUNDING_MODE") && (f = s[u], U(f, 0, 8, u), a = f), s.hasOwnProperty(u = "EXPONENTIAL_AT") && (f = s[u], f && f.pop ? (U(f[0], -X, 0, u), U(f[1], 0, X, u), h = f[0], c = f[1]) : (U(f, -X, X, u), h = -(c = f < 0 ? -f : f))), s.hasOwnProperty(u = "RANGE"))
          if (f = s[u], f && f.pop)
            U(f[0], -X, -1, u), U(f[1], 1, X, u), M = f[0], d = f[1];
          else if (U(f, -X, X, u), f)
            M = -(d = f < 0 ? -f : f);
          else
            throw Error(Q + u + " cannot be zero: " + f);
        if (s.hasOwnProperty(u = "CRYPTO"))
          if (f = s[u], f === !!f)
            if (f)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                P = f;
              else
                throw P = !f, Error(Q + "crypto unavailable");
            else
              P = f;
          else
            throw Error(Q + u + " not true or false: " + f);
        if (s.hasOwnProperty(u = "MODULO_MODE") && (f = s[u], U(f, 0, 9, u), _ = f), s.hasOwnProperty(u = "POW_PRECISION") && (f = s[u], U(f, 0, X, u), b = f), s.hasOwnProperty(u = "FORMAT"))
          if (f = s[u], typeof f == "object") L = f;
          else throw Error(Q + u + " not an object: " + f);
        if (s.hasOwnProperty(u = "ALPHABET"))
          if (f = s[u], typeof f == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(f))
            A = f.slice(0, 10) == "0123456789", O = f;
          else
            throw Error(Q + u + " invalid: " + f);
      } else
        throw Error(Q + "Object expected: " + s);
    return {
      DECIMAL_PLACES: l,
      ROUNDING_MODE: a,
      EXPONENTIAL_AT: [h, c],
      RANGE: [M, d],
      CRYPTO: P,
      MODULO_MODE: _,
      POW_PRECISION: b,
      FORMAT: L,
      ALPHABET: O
    };
  }, w.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!w.DEBUG) return !0;
    var u, f, x = s.c, p = s.e, y = s.s;
    e: if ({}.toString.call(x) == "[object Array]") {
      if ((y === 1 || y === -1) && p >= -X && p <= X && p === re(p)) {
        if (x[0] === 0) {
          if (p === 0 && x.length === 1) return !0;
          break e;
        }
        if (u = (p + 1) % G, u < 1 && (u += G), String(x[0]).length == u) {
          for (u = 0; u < x.length; u++)
            if (f = x[u], f < 0 || f >= se || f !== re(f)) break e;
          if (f !== 0) return !0;
        }
      }
    } else if (x === null && p === null && (y === null || y === 1 || y === -1))
      return !0;
    throw Error(Q + "Invalid BigNumber: " + s);
  }, w.maximum = w.max = function() {
    return F(arguments, -1);
  }, w.minimum = w.min = function() {
    return F(arguments, 1);
  }, w.random = (function() {
    var s = 9007199254740992, u = Math.random() * s & 2097151 ? function() {
      return re(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(f) {
      var x, p, y, v, g, m = 0, S = [], E = new w(o);
      if (f == null ? f = l : U(f, 0, X), v = Je(f / G), P)
        if (crypto.getRandomValues) {
          for (x = crypto.getRandomValues(new Uint32Array(v *= 2)); m < v; )
            g = x[m] * 131072 + (x[m + 1] >>> 11), g >= 9e15 ? (p = crypto.getRandomValues(new Uint32Array(2)), x[m] = p[0], x[m + 1] = p[1]) : (S.push(g % 1e14), m += 2);
          m = v / 2;
        } else if (crypto.randomBytes) {
          for (x = crypto.randomBytes(v *= 7); m < v; )
            g = (x[m] & 31) * 281474976710656 + x[m + 1] * 1099511627776 + x[m + 2] * 4294967296 + x[m + 3] * 16777216 + (x[m + 4] << 16) + (x[m + 5] << 8) + x[m + 6], g >= 9e15 ? crypto.randomBytes(7).copy(x, m) : (S.push(g % 1e14), m += 7);
          m = v / 7;
        } else
          throw P = !1, Error(Q + "crypto unavailable");
      if (!P)
        for (; m < v; )
          g = u(), g < 9e15 && (S[m++] = g % 1e14);
      for (v = S[--m], f %= G, v && f && (g = Ze[G - f], S[m] = re(v / g) * g); S[m] === 0; S.pop(), m--) ;
      if (m < 0)
        S = [y = 0];
      else {
        for (y = -1; S[0] === 0; S.splice(0, 1), y -= G) ;
        for (m = 1, g = S[0]; g >= 10; g /= 10, m++) ;
        m < G && (y -= G - m);
      }
      return E.e = y, E.c = S, E;
    };
  })(), w.sum = function() {
    for (var s = 1, u = arguments, f = new w(u[0]); s < u.length; ) f = f.plus(u[s++]);
    return f;
  }, r = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function u(f, x, p, y) {
      for (var v, g = [0], m, S = 0, E = f.length; S < E; ) {
        for (m = g.length; m--; g[m] *= x) ;
        for (g[0] += y.indexOf(f.charAt(S++)), v = 0; v < g.length; v++)
          g[v] > p - 1 && (g[v + 1] == null && (g[v + 1] = 0), g[v + 1] += g[v] / p | 0, g[v] %= p);
      }
      return g.reverse();
    }
    return function(f, x, p, y, v) {
      var g, m, S, E, N, B, I, H, K = f.indexOf("."), $ = l, q = a;
      for (K >= 0 && (E = b, b = 0, f = f.replace(".", ""), H = new w(x), B = H.pow(f.length - K), b = E, H.c = u(
        ce(te(B.c), B.e, "0"),
        10,
        p,
        s
      ), H.e = H.c.length), I = u(f, x, p, v ? (g = O, s) : (g = s, O)), S = E = I.length; I[--E] == 0; I.pop()) ;
      if (!I[0]) return g.charAt(0);
      if (K < 0 ? --S : (B.c = I, B.e = S, B.s = y, B = e(B, H, $, q, p), I = B.c, N = B.r, S = B.e), m = S + $ + 1, K = I[m], E = p / 2, N = N || m < 0 || I[m + 1] != null, N = q < 4 ? (K != null || N) && (q == 0 || q == (B.s < 0 ? 3 : 2)) : K > E || K == E && (q == 4 || N || q == 6 && I[m - 1] & 1 || q == (B.s < 0 ? 8 : 7)), m < 1 || !I[0])
        f = N ? ce(g.charAt(1), -$, g.charAt(0)) : g.charAt(0);
      else {
        if (I.length = m, N)
          for (--p; ++I[--m] > p; )
            I[m] = 0, m || (++S, I = [1].concat(I));
        for (E = I.length; !I[--E]; ) ;
        for (K = 0, f = ""; K <= E; f += g.charAt(I[K++])) ;
        f = ce(f, S, g.charAt(0));
      }
      return f;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(x, p, y) {
      var v, g, m, S, E = 0, N = x.length, B = p % ye, I = p / ye | 0;
      for (x = x.slice(); N--; )
        m = x[N] % ye, S = x[N] / ye | 0, v = I * m + S * B, g = B * m + v % ye * ye + E, E = (g / y | 0) + (v / ye | 0) + I * S, x[N] = g % y;
      return E && (x = [E].concat(x)), x;
    }
    function u(x, p, y, v) {
      var g, m;
      if (y != v)
        m = y > v ? 1 : -1;
      else
        for (g = m = 0; g < y; g++)
          if (x[g] != p[g]) {
            m = x[g] > p[g] ? 1 : -1;
            break;
          }
      return m;
    }
    function f(x, p, y, v) {
      for (var g = 0; y--; )
        x[y] -= g, g = x[y] < p[y] ? 1 : 0, x[y] = g * v + x[y] - p[y];
      for (; !x[0] && x.length > 1; x.splice(0, 1)) ;
    }
    return function(x, p, y, v, g) {
      var m, S, E, N, B, I, H, K, $, q, D, Y, Te, Xe, Ye, le, be, ee = x.s == p.s ? 1 : -1, W = x.c, V = p.c;
      if (!W || !W[0] || !V || !V[0])
        return new w(
          // Return NaN if either NaN, or both Infinity or 0.
          !x.s || !p.s || (W ? V && W[0] == V[0] : !V) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            W && W[0] == 0 || !V ? ee * 0 : ee / 0
          )
        );
      for (K = new w(ee), $ = K.c = [], S = x.e - p.e, ee = y + S + 1, g || (g = se, S = ne(x.e / G) - ne(p.e / G), ee = ee / G | 0), E = 0; V[E] == (W[E] || 0); E++) ;
      if (V[E] > (W[E] || 0) && S--, ee < 0)
        $.push(1), N = !0;
      else {
        for (Xe = W.length, le = V.length, E = 0, ee += 2, B = re(g / (V[0] + 1)), B > 1 && (V = s(V, B, g), W = s(W, B, g), le = V.length, Xe = W.length), Te = le, q = W.slice(0, le), D = q.length; D < le; q[D++] = 0) ;
        be = V.slice(), be = [0].concat(be), Ye = V[0], V[1] >= g / 2 && Ye++;
        do {
          if (B = 0, m = u(V, q, le, D), m < 0) {
            if (Y = q[0], le != D && (Y = Y * g + (q[1] || 0)), B = re(Y / Ye), B > 1)
              for (B >= g && (B = g - 1), I = s(V, B, g), H = I.length, D = q.length; u(I, q, H, D) == 1; )
                B--, f(I, le < H ? be : V, H, g), H = I.length, m = 1;
            else
              B == 0 && (m = B = 1), I = V.slice(), H = I.length;
            if (H < D && (I = [0].concat(I)), f(q, I, D, g), D = q.length, m == -1)
              for (; u(V, q, le, D) < 1; )
                B++, f(q, le < D ? be : V, D, g), D = q.length;
          } else m === 0 && (B++, q = [0]);
          $[E++] = B, q[0] ? q[D++] = W[Te] || 0 : (q = [W[Te]], D = 1);
        } while ((Te++ < Xe || q[0] != null) && ee--);
        N = q[0] != null, $[0] || $.splice(0, 1);
      }
      if (g == se) {
        for (E = 1, ee = $[0]; ee >= 10; ee /= 10, E++) ;
        C(K, y + (K.e = E + S * G - 1) + 1, v, N);
      } else
        K.e = S, K.r = +N;
      return K;
    };
  })();
  function R(s, u, f, x) {
    var p, y, v, g, m;
    if (f == null ? f = a : U(f, 0, 8), !s.c) return s.toString();
    if (p = s.c[0], v = s.e, u == null)
      m = te(s.c), m = x == 1 || x == 2 && (v <= h || v >= c) ? Re(m, v) : ce(m, v, "0");
    else if (s = C(new w(s), u, f), y = s.e, m = te(s.c), g = m.length, x == 1 || x == 2 && (u <= y || y <= h)) {
      for (; g < u; m += "0", g++) ;
      m = Re(m, y);
    } else if (u -= v + (x === 2 && y > v), m = ce(m, y, "0"), y + 1 > g) {
      if (--u > 0) for (m += "."; u--; m += "0") ;
    } else if (u += y - g, u > 0)
      for (y + 1 == g && (m += "."); u--; m += "0") ;
    return s.s < 0 && p ? "-" + m : m;
  }
  function F(s, u) {
    for (var f, x, p = 1, y = new w(s[0]); p < s.length; p++)
      x = new w(s[p]), (!x.s || (f = de(y, x)) === u || f === 0 && y.s === u) && (y = x);
    return y;
  }
  function T(s, u, f) {
    for (var x = 1, p = u.length; !u[--p]; u.pop()) ;
    for (p = u[0]; p >= 10; p /= 10, x++) ;
    return (f = x + f * G - 1) > d ? s.c = s.e = null : f < M ? s.c = [s.e = 0] : (s.e = f, s.c = u), s;
  }
  n = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, u = /^([^.]+)\\.$/, f = /^\\.([^.]+)$/, x = /^-?(Infinity|NaN)$/, p = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(y, v, g, m) {
      var S, E = g ? v : v.replace(p, "");
      if (x.test(E))
        y.s = isNaN(E) ? null : E < 0 ? -1 : 1;
      else {
        if (!g && (E = E.replace(s, function(N, B, I) {
          return S = (I = I.toLowerCase()) == "x" ? 16 : I == "b" ? 2 : 8, !m || m == S ? B : N;
        }), m && (S = m, E = E.replace(u, "$1").replace(f, "0.$1")), v != E))
          return new w(E, S);
        if (w.DEBUG)
          throw Error(Q + "Not a" + (m ? " base " + m : "") + " number: " + v);
        y.s = null;
      }
      y.c = y.e = null;
    };
  })();
  function C(s, u, f, x) {
    var p, y, v, g, m, S, E, N = s.c, B = Ze;
    if (N) {
      e: {
        for (p = 1, g = N[0]; g >= 10; g /= 10, p++) ;
        if (y = u - p, y < 0)
          y += G, v = u, m = N[S = 0], E = re(m / B[p - v - 1] % 10);
        else if (S = Je((y + 1) / G), S >= N.length)
          if (x) {
            for (; N.length <= S; N.push(0)) ;
            m = E = 0, p = 1, y %= G, v = y - G + 1;
          } else
            break e;
        else {
          for (m = g = N[S], p = 1; g >= 10; g /= 10, p++) ;
          y %= G, v = y - G + p, E = v < 0 ? 0 : re(m / B[p - v - 1] % 10);
        }
        if (x = x || u < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        N[S + 1] != null || (v < 0 ? m : m % B[p - v - 1]), x = f < 4 ? (E || x) && (f == 0 || f == (s.s < 0 ? 3 : 2)) : E > 5 || E == 5 && (f == 4 || x || f == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? v > 0 ? m / B[p - v] : 0 : N[S - 1]) % 10 & 1 || f == (s.s < 0 ? 8 : 7)), u < 1 || !N[0])
          return N.length = 0, x ? (u -= s.e + 1, N[0] = B[(G - u % G) % G], s.e = -u || 0) : N[0] = s.e = 0, s;
        if (y == 0 ? (N.length = S, g = 1, S--) : (N.length = S + 1, g = B[G - y], N[S] = v > 0 ? re(m / B[p - v] % B[v]) * g : 0), x)
          for (; ; )
            if (S == 0) {
              for (y = 1, v = N[0]; v >= 10; v /= 10, y++) ;
              for (v = N[0] += g, g = 1; v >= 10; v /= 10, g++) ;
              y != g && (s.e++, N[0] == se && (N[0] = 1));
              break;
            } else {
              if (N[S] += g, N[S] != se) break;
              N[S--] = 0, g = 1;
            }
        for (y = N.length; N[--y] === 0; N.pop()) ;
      }
      s.e > d ? s.c = s.e = null : s.e < M && (s.c = [s.e = 0]);
    }
    return s;
  }
  function k(s) {
    var u, f = s.e;
    return f === null ? s.toString() : (u = te(s.c), u = f <= h || f >= c ? Re(u, f) : ce(u, f, "0"), s.s < 0 ? "-" + u : u);
  }
  return i.absoluteValue = i.abs = function() {
    var s = new w(this);
    return s.s < 0 && (s.s = 1), s;
  }, i.comparedTo = function(s, u) {
    return de(this, new w(s, u));
  }, i.decimalPlaces = i.dp = function(s, u) {
    var f, x, p, y = this;
    if (s != null)
      return U(s, 0, X), u == null ? u = a : U(u, 0, 8), C(new w(y), s + y.e + 1, u);
    if (!(f = y.c)) return null;
    if (x = ((p = f.length - 1) - ne(this.e / G)) * G, p = f[p]) for (; p % 10 == 0; p /= 10, x--) ;
    return x < 0 && (x = 0), x;
  }, i.dividedBy = i.div = function(s, u) {
    return e(this, new w(s, u), l, a);
  }, i.dividedToIntegerBy = i.idiv = function(s, u) {
    return e(this, new w(s, u), 0, 1);
  }, i.exponentiatedBy = i.pow = function(s, u) {
    var f, x, p, y, v, g, m, S, E, N = this;
    if (s = new w(s), s.c && !s.isInteger())
      throw Error(Q + "Exponent not an integer: " + k(s));
    if (u != null && (u = new w(u)), g = s.e > 14, !N.c || !N.c[0] || N.c[0] == 1 && !N.e && N.c.length == 1 || !s.c || !s.c[0])
      return E = new w(Math.pow(+k(N), g ? s.s * (2 - Ce(s)) : +k(s))), u ? E.mod(u) : E;
    if (m = s.s < 0, u) {
      if (u.c ? !u.c[0] : !u.s) return new w(NaN);
      x = !m && N.isInteger() && u.isInteger(), x && (N = N.mod(u));
    } else {
      if (s.e > 9 && (N.e > 0 || N.e < -1 || (N.e == 0 ? N.c[0] > 1 || g && N.c[1] >= 24e7 : N.c[0] < 8e13 || g && N.c[0] <= 9999975e7)))
        return y = N.s < 0 && Ce(s) ? -0 : 0, N.e > -1 && (y = 1 / y), new w(m ? 1 / y : y);
      b && (y = Je(b / G + 2));
    }
    for (g ? (f = new w(0.5), m && (s.s = 1), S = Ce(s)) : (p = Math.abs(+k(s)), S = p % 2), E = new w(o); ; ) {
      if (S) {
        if (E = E.times(N), !E.c) break;
        y ? E.c.length > y && (E.c.length = y) : x && (E = E.mod(u));
      }
      if (p) {
        if (p = re(p / 2), p === 0) break;
        S = p % 2;
      } else if (s = s.times(f), C(s, s.e + 1, 1), s.e > 14)
        S = Ce(s);
      else {
        if (p = +k(s), p === 0) break;
        S = p % 2;
      }
      N = N.times(N), y ? N.c && N.c.length > y && (N.c.length = y) : x && (N = N.mod(u));
    }
    return x ? E : (m && (E = o.div(E)), u ? E.mod(u) : y ? C(E, b, a, v) : E);
  }, i.integerValue = function(s) {
    var u = new w(this);
    return s == null ? s = a : U(s, 0, 8), C(u, u.e + 1, s);
  }, i.isEqualTo = i.eq = function(s, u) {
    return de(this, new w(s, u)) === 0;
  }, i.isFinite = function() {
    return !!this.c;
  }, i.isGreaterThan = i.gt = function(s, u) {
    return de(this, new w(s, u)) > 0;
  }, i.isGreaterThanOrEqualTo = i.gte = function(s, u) {
    return (u = de(this, new w(s, u))) === 1 || u === 0;
  }, i.isInteger = function() {
    return !!this.c && ne(this.e / G) > this.c.length - 2;
  }, i.isLessThan = i.lt = function(s, u) {
    return de(this, new w(s, u)) < 0;
  }, i.isLessThanOrEqualTo = i.lte = function(s, u) {
    return (u = de(this, new w(s, u))) === -1 || u === 0;
  }, i.isNaN = function() {
    return !this.s;
  }, i.isNegative = function() {
    return this.s < 0;
  }, i.isPositive = function() {
    return this.s > 0;
  }, i.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, i.minus = function(s, u) {
    var f, x, p, y, v = this, g = v.s;
    if (s = new w(s, u), u = s.s, !g || !u) return new w(NaN);
    if (g != u)
      return s.s = -u, v.plus(s);
    var m = v.e / G, S = s.e / G, E = v.c, N = s.c;
    if (!m || !S) {
      if (!E || !N) return E ? (s.s = -u, s) : new w(N ? v : NaN);
      if (!E[0] || !N[0])
        return N[0] ? (s.s = -u, s) : new w(E[0] ? v : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          a == 3 ? -0 : 0
        ));
    }
    if (m = ne(m), S = ne(S), E = E.slice(), g = m - S) {
      for ((y = g < 0) ? (g = -g, p = E) : (S = m, p = N), p.reverse(), u = g; u--; p.push(0)) ;
      p.reverse();
    } else
      for (x = (y = (g = E.length) < (u = N.length)) ? g : u, g = u = 0; u < x; u++)
        if (E[u] != N[u]) {
          y = E[u] < N[u];
          break;
        }
    if (y && (p = E, E = N, N = p, s.s = -s.s), u = (x = N.length) - (f = E.length), u > 0) for (; u--; E[f++] = 0) ;
    for (u = se - 1; x > g; ) {
      if (E[--x] < N[x]) {
        for (f = x; f && !E[--f]; E[f] = u) ;
        --E[f], E[x] += se;
      }
      E[x] -= N[x];
    }
    for (; E[0] == 0; E.splice(0, 1), --S) ;
    return E[0] ? T(s, E, S) : (s.s = a == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, i.modulo = i.mod = function(s, u) {
    var f, x, p = this;
    return s = new w(s, u), !p.c || !s.s || s.c && !s.c[0] ? new w(NaN) : !s.c || p.c && !p.c[0] ? new w(p) : (_ == 9 ? (x = s.s, s.s = 1, f = e(p, s, 0, 3), s.s = x, f.s *= x) : f = e(p, s, 0, _), s = p.minus(f.times(s)), !s.c[0] && _ == 1 && (s.s = p.s), s);
  }, i.multipliedBy = i.times = function(s, u) {
    var f, x, p, y, v, g, m, S, E, N, B, I, H, K, $, q = this, D = q.c, Y = (s = new w(s, u)).c;
    if (!D || !Y || !D[0] || !Y[0])
      return !q.s || !s.s || D && !D[0] && !Y || Y && !Y[0] && !D ? s.c = s.e = s.s = null : (s.s *= q.s, !D || !Y ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (x = ne(q.e / G) + ne(s.e / G), s.s *= q.s, m = D.length, N = Y.length, m < N && (H = D, D = Y, Y = H, p = m, m = N, N = p), p = m + N, H = []; p--; H.push(0)) ;
    for (K = se, $ = ye, p = N; --p >= 0; ) {
      for (f = 0, B = Y[p] % $, I = Y[p] / $ | 0, v = m, y = p + v; y > p; )
        S = D[--v] % $, E = D[v] / $ | 0, g = I * S + E * B, S = B * S + g % $ * $ + H[y] + f, f = (S / K | 0) + (g / $ | 0) + I * E, H[y--] = S % K;
      H[y] = f;
    }
    return f ? ++x : H.splice(0, 1), T(s, H, x);
  }, i.negated = function() {
    var s = new w(this);
    return s.s = -s.s || null, s;
  }, i.plus = function(s, u) {
    var f, x = this, p = x.s;
    if (s = new w(s, u), u = s.s, !p || !u) return new w(NaN);
    if (p != u)
      return s.s = -u, x.minus(s);
    var y = x.e / G, v = s.e / G, g = x.c, m = s.c;
    if (!y || !v) {
      if (!g || !m) return new w(p / 0);
      if (!g[0] || !m[0]) return m[0] ? s : new w(g[0] ? x : p * 0);
    }
    if (y = ne(y), v = ne(v), g = g.slice(), p = y - v) {
      for (p > 0 ? (v = y, f = m) : (p = -p, f = g), f.reverse(); p--; f.push(0)) ;
      f.reverse();
    }
    for (p = g.length, u = m.length, p - u < 0 && (f = m, m = g, g = f, u = p), p = 0; u; )
      p = (g[--u] = g[u] + m[u] + p) / se | 0, g[u] = se === g[u] ? 0 : g[u] % se;
    return p && (g = [p].concat(g), ++v), T(s, g, v);
  }, i.precision = i.sd = function(s, u) {
    var f, x, p, y = this;
    if (s != null && s !== !!s)
      return U(s, 1, X), u == null ? u = a : U(u, 0, 8), C(new w(y), s, u);
    if (!(f = y.c)) return null;
    if (p = f.length - 1, x = p * G + 1, p = f[p]) {
      for (; p % 10 == 0; p /= 10, x--) ;
      for (p = f[0]; p >= 10; p /= 10, x++) ;
    }
    return s && y.e + 1 > x && (x = y.e + 1), x;
  }, i.shiftedBy = function(s) {
    return U(s, -We, We), this.times("1e" + s);
  }, i.squareRoot = i.sqrt = function() {
    var s, u, f, x, p, y = this, v = y.c, g = y.s, m = y.e, S = l + 4, E = new w("0.5");
    if (g !== 1 || !v || !v[0])
      return new w(!g || g < 0 && (!v || v[0]) ? NaN : v ? y : 1 / 0);
    if (g = Math.sqrt(+k(y)), g == 0 || g == 1 / 0 ? (u = te(v), (u.length + m) % 2 == 0 && (u += "0"), g = Math.sqrt(+u), m = ne((m + 1) / 2) - (m < 0 || m % 2), g == 1 / 0 ? u = "5e" + m : (u = g.toExponential(), u = u.slice(0, u.indexOf("e") + 1) + m), f = new w(u)) : f = new w(g + ""), f.c[0]) {
      for (m = f.e, g = m + S, g < 3 && (g = 0); ; )
        if (p = f, f = E.times(p.plus(e(y, p, S, 1))), te(p.c).slice(0, g) === (u = te(f.c)).slice(0, g))
          if (f.e < m && --g, u = u.slice(g - 3, g + 1), u == "9999" || !x && u == "4999") {
            if (!x && (C(p, p.e + l + 2, 0), p.times(p).eq(y))) {
              f = p;
              break;
            }
            S += 4, g += 4, x = 1;
          } else {
            (!+u || !+u.slice(1) && u.charAt(0) == "5") && (C(f, f.e + l + 2, 1), s = !f.times(f).eq(y));
            break;
          }
    }
    return C(f, f.e + l + 1, a, s);
  }, i.toExponential = function(s, u) {
    return s != null && (U(s, 0, X), s++), R(this, s, u, 1);
  }, i.toFixed = function(s, u) {
    return s != null && (U(s, 0, X), s = s + this.e + 1), R(this, s, u);
  }, i.toFormat = function(s, u, f) {
    var x, p = this;
    if (f == null)
      s != null && u && typeof u == "object" ? (f = u, u = null) : s && typeof s == "object" ? (f = s, s = u = null) : f = L;
    else if (typeof f != "object")
      throw Error(Q + "Argument not an object: " + f);
    if (x = p.toFixed(s, u), p.c) {
      var y, v = x.split("."), g = +f.groupSize, m = +f.secondaryGroupSize, S = f.groupSeparator || "", E = v[0], N = v[1], B = p.s < 0, I = B ? E.slice(1) : E, H = I.length;
      if (m && (y = g, g = m, m = y, H -= y), g > 0 && H > 0) {
        for (y = H % g || g, E = I.substr(0, y); y < H; y += g) E += S + I.substr(y, g);
        m > 0 && (E += S + I.slice(y)), B && (E = "-" + E);
      }
      x = N ? E + (f.decimalSeparator || "") + ((m = +f.fractionGroupSize) ? N.replace(
        new RegExp("\\\\d{" + m + "}\\\\B", "g"),
        "$&" + (f.fractionGroupSeparator || "")
      ) : N) : E;
    }
    return (f.prefix || "") + x + (f.suffix || "");
  }, i.toFraction = function(s) {
    var u, f, x, p, y, v, g, m, S, E, N, B, I = this, H = I.c;
    if (s != null && (g = new w(s), !g.isInteger() && (g.c || g.s !== 1) || g.lt(o)))
      throw Error(Q + "Argument " + (g.isInteger() ? "out of range: " : "not an integer: ") + k(g));
    if (!H) return new w(I);
    for (u = new w(o), S = f = new w(o), x = m = new w(o), B = te(H), y = u.e = B.length - I.e - 1, u.c[0] = Ze[(v = y % G) < 0 ? G + v : v], s = !s || g.comparedTo(u) > 0 ? y > 0 ? u : S : g, v = d, d = 1 / 0, g = new w(B), m.c[0] = 0; E = e(g, u, 0, 1), p = f.plus(E.times(x)), p.comparedTo(s) != 1; )
      f = x, x = p, S = m.plus(E.times(p = S)), m = p, u = g.minus(E.times(p = u)), g = p;
    return p = e(s.minus(f), x, 0, 1), m = m.plus(p.times(S)), f = f.plus(p.times(x)), m.s = S.s = I.s, y = y * 2, N = e(S, x, y, a).minus(I).abs().comparedTo(
      e(m, f, y, a).minus(I).abs()
    ) < 1 ? [S, x] : [m, f], d = v, N;
  }, i.toNumber = function() {
    return +k(this);
  }, i.toPrecision = function(s, u) {
    return s != null && U(s, 1, X), R(this, s, u, 2);
  }, i.toString = function(s) {
    var u, f = this, x = f.s, p = f.e;
    return p === null ? x ? (u = "Infinity", x < 0 && (u = "-" + u)) : u = "NaN" : (s == null ? u = p <= h || p >= c ? Re(te(f.c), p) : ce(te(f.c), p, "0") : s === 10 && A ? (f = C(new w(f), l + p + 1, a), u = ce(te(f.c), f.e, "0")) : (U(s, 2, O.length, "Base"), u = r(ce(te(f.c), p, "0"), 10, s, x, !0)), x < 0 && f.c[0] && (u = "-" + u)), u;
  }, i.valueOf = i.toJSON = function() {
    return k(this);
  }, i._isBigNumber = !0, i[Symbol.toStringTag] = "BigNumber", i[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = i.valueOf, t != null && w.set(t), w;
}
function ne(t) {
  var e = t | 0;
  return t > 0 || t === e ? e : e - 1;
}
function te(t) {
  for (var e, r, n = 1, i = t.length, o = t[0] + ""; n < i; ) {
    for (e = t[n++] + "", r = G - e.length; r--; e = "0" + e) ;
    o += e;
  }
  for (i = o.length; o.charCodeAt(--i) === 48; ) ;
  return o.slice(0, i + 1 || 1);
}
function de(t, e) {
  var r, n, i = t.c, o = e.c, l = t.s, a = e.s, h = t.e, c = e.e;
  if (!l || !a) return null;
  if (r = i && !i[0], n = o && !o[0], r || n) return r ? n ? 0 : -a : l;
  if (l != a) return l;
  if (r = l < 0, n = h == c, !i || !o) return n ? 0 : !i ^ r ? 1 : -1;
  if (!n) return h > c ^ r ? 1 : -1;
  for (a = (h = i.length) < (c = o.length) ? h : c, l = 0; l < a; l++) if (i[l] != o[l]) return i[l] > o[l] ^ r ? 1 : -1;
  return h == c ? 0 : h > c ^ r ? 1 : -1;
}
function U(t, e, r, n) {
  if (t < e || t > r || t !== re(t))
    throw Error(Q + (n || "Argument") + (typeof t == "number" ? t < e || t > r ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(t));
}
function Ce(t) {
  var e = t.c.length - 1;
  return ne(t.e / G) == e && t.c[e] % 2 != 0;
}
function Re(t, e) {
  return (t.length > 1 ? t.charAt(0) + "." + t.slice(1) : t) + (e < 0 ? "e" : "e+") + e;
}
function ce(t, e, r) {
  var n, i;
  if (e < 0) {
    for (i = r + "."; ++e; i += r) ;
    t = i + t;
  } else if (n = t.length, ++e > n) {
    for (i = r, e -= n; --e; i += r) ;
    t += i;
  } else e < n && (t = t.slice(0, e) + "." + t.slice(e));
  return t;
}
var fe = Bt(), Jt = class {
  key;
  left = null;
  right = null;
  constructor(t) {
    this.key = t;
  }
}, Ee = class extends Jt {
  constructor(t) {
    super(t);
  }
}, Wt = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(t) {
    const e = this.root;
    if (e == null)
      return this.compare(t, t), -1;
    let r = null, n = null, i = null, o = null, l = e;
    const a = this.compare;
    let h;
    for (; ; )
      if (h = a(l.key, t), h > 0) {
        let c = l.left;
        if (c == null || (h = a(c.key, t), h > 0 && (l.left = c.right, c.right = l, l = c, c = l.left, c == null)))
          break;
        r == null ? n = l : r.left = l, r = l, l = c;
      } else if (h < 0) {
        let c = l.right;
        if (c == null || (h = a(c.key, t), h < 0 && (l.right = c.left, c.left = l, l = c, c = l.right, c == null)))
          break;
        i == null ? o = l : i.right = l, i = l, l = c;
      } else
        break;
    return i != null && (i.right = l.left, l.left = o), r != null && (r.left = l.right, l.right = n), this.root !== l && (this.root = l, this.splayCount++), h;
  }
  splayMin(t) {
    let e = t, r = e.left;
    for (; r != null; ) {
      const n = r;
      e.left = n.right, n.right = e, e = n, r = e.left;
    }
    return e;
  }
  splayMax(t) {
    let e = t, r = e.right;
    for (; r != null; ) {
      const n = r;
      e.right = n.left, n.left = e, e = n, r = e.right;
    }
    return e;
  }
  _delete(t) {
    if (this.root == null || this.splay(t) != 0) return null;
    let r = this.root;
    const n = r, i = r.left;
    if (this.size--, i == null)
      this.root = r.right;
    else {
      const o = r.right;
      r = this.splayMax(i), r.right = o, this.root = r;
    }
    return this.modificationCount++, n;
  }
  addNewRoot(t, e) {
    this.size++, this.modificationCount++;
    const r = this.root;
    if (r == null) {
      this.root = t;
      return;
    }
    e < 0 ? (t.left = r, t.right = r.right, r.right = null) : (t.right = r, t.left = r.left, r.left = null), this.root = t;
  }
  _first() {
    const t = this.root;
    return t == null ? null : (this.root = this.splayMin(t), this.root);
  }
  _last() {
    const t = this.root;
    return t == null ? null : (this.root = this.splayMax(t), this.root);
  }
  clear() {
    this.root = null, this.size = 0, this.modificationCount++;
  }
  has(t) {
    return this.validKey(t) && this.splay(t) == 0;
  }
  defaultCompare() {
    return (t, e) => t < e ? -1 : t > e ? 1 : 0;
  }
  wrap() {
    return {
      getRoot: () => this.root,
      setRoot: (t) => {
        this.root = t;
      },
      getSize: () => this.size,
      getModificationCount: () => this.modificationCount,
      getSplayCount: () => this.splayCount,
      setSplayCount: (t) => {
        this.splayCount = t;
      },
      splay: (t) => this.splay(t),
      has: (t) => this.has(t)
    };
  }
}, He = class Me extends Wt {
  root = null;
  compare;
  validKey;
  constructor(e, r) {
    super(), this.compare = e ?? this.defaultCompare(), this.validKey = r ?? ((n) => n != null && n != null);
  }
  delete(e) {
    return this.validKey(e) ? this._delete(e) != null : !1;
  }
  deleteAll(e) {
    for (const r of e)
      this.delete(r);
  }
  forEach(e) {
    const r = this[Symbol.iterator]();
    let n;
    for (; n = r.next(), !n.done; )
      e(n.value, n.value, this);
  }
  add(e) {
    const r = this.splay(e);
    return r != 0 && this.addNewRoot(new Ee(e), r), this;
  }
  addAndReturn(e) {
    const r = this.splay(e);
    return r != 0 && this.addNewRoot(new Ee(e), r), this.root.key;
  }
  addAll(e) {
    for (const r of e)
      this.add(r);
  }
  isEmpty() {
    return this.root == null;
  }
  isNotEmpty() {
    return this.root != null;
  }
  single() {
    if (this.size == 0) throw "Bad state: No element";
    if (this.size > 1) throw "Bad state: Too many element";
    return this.root.key;
  }
  first() {
    if (this.size == 0) throw "Bad state: No element";
    return this._first().key;
  }
  last() {
    if (this.size == 0) throw "Bad state: No element";
    return this._last().key;
  }
  lastBefore(e) {
    if (e == null) throw "Invalid arguments(s)";
    if (this.root == null) return null;
    if (this.splay(e) < 0) return this.root.key;
    let n = this.root.left;
    if (n == null) return null;
    let i = n.right;
    for (; i != null; )
      n = i, i = n.right;
    return n.key;
  }
  firstAfter(e) {
    if (e == null) throw "Invalid arguments(s)";
    if (this.root == null) return null;
    if (this.splay(e) > 0) return this.root.key;
    let n = this.root.right;
    if (n == null) return null;
    let i = n.left;
    for (; i != null; )
      n = i, i = n.left;
    return n.key;
  }
  retainAll(e) {
    const r = new Me(this.compare, this.validKey), n = this.modificationCount;
    for (const i of e) {
      if (n != this.modificationCount)
        throw "Concurrent modification during iteration.";
      this.validKey(i) && this.splay(i) == 0 && r.add(this.root.key);
    }
    r.size != this.size && (this.root = r.root, this.size = r.size, this.modificationCount++);
  }
  lookup(e) {
    return !this.validKey(e) || this.splay(e) != 0 ? null : this.root.key;
  }
  intersection(e) {
    const r = new Me(this.compare, this.validKey);
    for (const n of this)
      e.has(n) && r.add(n);
    return r;
  }
  difference(e) {
    const r = new Me(this.compare, this.validKey);
    for (const n of this)
      e.has(n) || r.add(n);
    return r;
  }
  union(e) {
    const r = this.clone();
    return r.addAll(e), r;
  }
  clone() {
    const e = new Me(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function r(i, o) {
      let l, a;
      do {
        if (l = i.left, a = i.right, l != null) {
          const h = new Ee(l.key);
          o.left = h, r(l, h);
        }
        if (a != null) {
          const h = new Ee(a.key);
          o.right = h, i = a, o = h;
        }
      } while (a != null);
    }
    const n = new Ee(e.key);
    return r(e, n), n;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new Qt(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new Zt(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, It = class {
  tree;
  path = new Array();
  modificationCount = null;
  splayCount;
  constructor(t) {
    this.tree = t, this.splayCount = t.getSplayCount();
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.moveNext() ? { done: !1, value: this.current() } : { done: !0, value: null };
  }
  current() {
    if (!this.path.length) return null;
    const t = this.path[this.path.length - 1];
    return this.getValue(t);
  }
  rebuildPath(t) {
    this.path.splice(0, this.path.length), this.tree.splay(t), this.path.push(this.tree.getRoot()), this.splayCount = this.tree.getSplayCount();
  }
  findLeftMostDescendent(t) {
    for (; t != null; )
      this.path.push(t), t = t.left;
  }
  moveNext() {
    if (this.modificationCount != this.tree.getModificationCount()) {
      if (this.modificationCount == null) {
        this.modificationCount = this.tree.getModificationCount();
        let r = this.tree.getRoot();
        for (; r != null; )
          this.path.push(r), r = r.left;
        return this.path.length > 0;
      }
      throw "Concurrent modification during iteration.";
    }
    if (!this.path.length) return !1;
    this.splayCount != this.tree.getSplayCount() && this.rebuildPath(this.path[this.path.length - 1].key);
    let t = this.path[this.path.length - 1], e = t.right;
    if (e != null) {
      for (; e != null; )
        this.path.push(e), e = e.left;
      return !0;
    }
    for (this.path.pop(); this.path.length && this.path[this.path.length - 1].right === t; )
      t = this.path.pop();
    return this.path.length > 0;
  }
}, Zt = class extends It {
  getValue(t) {
    return t.key;
  }
}, Qt = class extends It {
  getValue(t) {
    return [t.key, t.key];
  }
}, Gt = (t) => () => t, rt = (t) => {
  const e = t ? (r, n) => n.minus(r).abs().isLessThanOrEqualTo(t) : Gt(!1);
  return (r, n) => e(r, n) ? 0 : r.comparedTo(n);
};
function jt(t) {
  const e = t ? (r, n, i, o, l) => r.exponentiatedBy(2).isLessThanOrEqualTo(
    o.minus(n).exponentiatedBy(2).plus(l.minus(i).exponentiatedBy(2)).times(t)
  ) : Gt(!1);
  return (r, n, i) => {
    const o = r.x, l = r.y, a = i.x, h = i.y, c = l.minus(h).times(n.x.minus(a)).minus(o.minus(a).times(n.y.minus(h)));
    return e(c, o, l, a, h) ? 0 : c.comparedTo(0);
  };
}
var er = (t) => t, tr = (t) => {
  if (t) {
    const e = new He(rt(t)), r = new He(rt(t)), n = (o, l) => l.addAndReturn(o), i = (o) => ({
      x: n(o.x, e),
      y: n(o.y, r)
    });
    return i({ x: new fe(0), y: new fe(0) }), i;
  }
  return er;
}, nt = (t) => ({
  set: (e) => {
    pe = nt(e);
  },
  reset: () => nt(t),
  compare: rt(t),
  snap: tr(t),
  orient: jt(t)
}), pe = nt(), Se = (t, e) => t.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(t.ur.x) && t.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(t.ur.y), it = (t, e) => {
  if (e.ur.x.isLessThan(t.ll.x) || t.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(t.ll.y) || t.ur.y.isLessThan(e.ll.y))
    return null;
  const r = t.ll.x.isLessThan(e.ll.x) ? e.ll.x : t.ll.x, n = t.ur.x.isLessThan(e.ur.x) ? t.ur.x : e.ur.x, i = t.ll.y.isLessThan(e.ll.y) ? e.ll.y : t.ll.y, o = t.ur.y.isLessThan(e.ur.y) ? t.ur.y : e.ur.y;
  return { ll: { x: r, y: i }, ur: { x: n, y: o } };
}, Ie = (t, e) => t.x.times(e.y).minus(t.y.times(e.x)), qt = (t, e) => t.x.times(e.x).plus(t.y.times(e.y)), De = (t) => qt(t, t).sqrt(), rr = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return Ie(i, n).div(De(i)).div(De(n));
}, nr = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return qt(i, n).div(De(i)).div(De(n));
}, pt = (t, e, r) => e.y.isZero() ? null : { x: t.x.plus(e.x.div(e.y).times(r.minus(t.y))), y: r }, gt = (t, e, r) => e.x.isZero() ? null : { x: r, y: t.y.plus(e.y.div(e.x).times(r.minus(t.x))) }, ir = (t, e, r, n) => {
  if (e.x.isZero()) return gt(r, n, t.x);
  if (n.x.isZero()) return gt(t, e, r.x);
  if (e.y.isZero()) return pt(r, n, t.y);
  if (n.y.isZero()) return pt(t, e, r.y);
  const i = Ie(e, n);
  if (i.isZero()) return null;
  const o = { x: r.x.minus(t.x), y: r.y.minus(t.y) }, l = Ie(o, e).div(i), a = Ie(o, n).div(i), h = t.x.plus(a.times(e.x)), c = r.x.plus(l.times(n.x)), M = t.y.plus(a.times(e.y)), d = r.y.plus(l.times(n.y)), P = h.plus(c).div(2), _ = M.plus(d).div(2);
  return { x: P, y: _ };
}, ae = class Ht {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, r) {
    const n = Ht.comparePoints(e.point, r.point);
    return n !== 0 ? n : (e.point !== r.point && e.link(r), e.isLeft !== r.isLeft ? e.isLeft ? 1 : -1 : Ue.compare(e.segment, r.segment));
  }
  // for ordering points in sweep line order
  static comparePoints(e, r) {
    return e.x.isLessThan(r.x) ? -1 : e.x.isGreaterThan(r.x) ? 1 : e.y.isLessThan(r.y) ? -1 : e.y.isGreaterThan(r.y) ? 1 : 0;
  }
  // Warning: 'point' input will be modified and re-used (for performance)
  constructor(e, r) {
    e.events === void 0 ? e.events = [this] : e.events.push(this), this.point = e, this.isLeft = r;
  }
  link(e) {
    if (e.point === this.point)
      throw new Error("Tried to link already linked events");
    const r = e.point.events;
    for (let n = 0, i = r.length; n < i; n++) {
      const o = r[n];
      this.point.events.push(o), o.point = this.point;
    }
    this.checkForConsuming();
  }
  /* Do a pass over our linked events and check to see if any pair
   * of segments match, and should be consumed. */
  checkForConsuming() {
    const e = this.point.events.length;
    for (let r = 0; r < e; r++) {
      const n = this.point.events[r];
      if (n.segment.consumedBy === void 0)
        for (let i = r + 1; i < e; i++) {
          const o = this.point.events[i];
          o.consumedBy === void 0 && n.otherSE.point.events === o.otherSE.point.events && n.segment.consume(o.segment);
        }
    }
  }
  getAvailableLinkedEvents() {
    const e = [];
    for (let r = 0, n = this.point.events.length; r < n; r++) {
      const i = this.point.events[r];
      i !== this && !i.segment.ringOut && i.segment.isInResult() && e.push(i);
    }
    return e;
  }
  /**
   * Returns a comparator function for sorting linked events that will
   * favor the event that will give us the smallest left-side angle.
   * All ring construction starts as low as possible heading to the right,
   * so by always turning left as sharp as possible we'll get polygons
   * without uncessary loops & holes.
   *
   * The comparator function has a compute cache such that it avoids
   * re-computing already-computed values.
   */
  getLeftmostComparator(e) {
    const r = /* @__PURE__ */ new Map(), n = (i) => {
      const o = i.otherSE;
      r.set(i, {
        sine: rr(this.point, e.point, o.point),
        cosine: nr(this.point, e.point, o.point)
      });
    };
    return (i, o) => {
      r.has(i) || n(i), r.has(o) || n(o);
      const { sine: l, cosine: a } = r.get(i), { sine: h, cosine: c } = r.get(o);
      return l.isGreaterThanOrEqualTo(0) && h.isGreaterThanOrEqualTo(0) ? a.isLessThan(c) ? 1 : a.isGreaterThan(c) ? -1 : 0 : l.isLessThan(0) && h.isLessThan(0) ? a.isLessThan(c) ? -1 : a.isGreaterThan(c) ? 1 : 0 : h.isLessThan(l) ? -1 : h.isGreaterThan(l) ? 1 : 0;
    };
  }
}, sr = class st {
  events;
  poly;
  _isExteriorRing;
  _enclosingRing;
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory(e) {
    const r = [];
    for (let n = 0, i = e.length; n < i; n++) {
      const o = e[n];
      if (!o.isInResult() || o.ringOut) continue;
      let l = null, a = o.leftSE, h = o.rightSE;
      const c = [a], M = a.point, d = [];
      for (; l = a, a = h, c.push(a), a.point !== M; )
        for (; ; ) {
          const P = a.getAvailableLinkedEvents();
          if (P.length === 0) {
            const L = c[0].point, O = c[c.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${L.x}, \${L.y}]. Last matching segment found ends at [\${O.x}, \${O.y}].\`
            );
          }
          if (P.length === 1) {
            h = P[0].otherSE;
            break;
          }
          let _ = null;
          for (let L = 0, O = d.length; L < O; L++)
            if (d[L].point === a.point) {
              _ = L;
              break;
            }
          if (_ !== null) {
            const L = d.splice(_)[0], O = c.splice(L.index);
            O.unshift(O[0].otherSE), r.push(new st(O.reverse()));
            continue;
          }
          d.push({
            index: c.length,
            point: a.point
          });
          const b = a.getLeftmostComparator(l);
          h = P.sort(b)[0].otherSE;
          break;
        }
      r.push(new st(c));
    }
    return r;
  }
  constructor(e) {
    this.events = e;
    for (let r = 0, n = e.length; r < n; r++)
      e[r].segment.ringOut = this;
    this.poly = null;
  }
  getGeom() {
    let e = this.events[0].point;
    const r = [e];
    for (let c = 1, M = this.events.length - 1; c < M; c++) {
      const d = this.events[c].point, P = this.events[c + 1].point;
      pe.orient(d, e, P) !== 0 && (r.push(d), e = d);
    }
    if (r.length === 1) return null;
    const n = r[0], i = r[1];
    pe.orient(n, e, i) === 0 && r.shift(), r.push(r[0]);
    const o = this.isExteriorRing() ? 1 : -1, l = this.isExteriorRing() ? 0 : r.length - 1, a = this.isExteriorRing() ? r.length : -1, h = [];
    for (let c = l; c != a; c += o)
      h.push([r[c].x.toNumber(), r[c].y.toNumber()]);
    return h;
  }
  isExteriorRing() {
    if (this._isExteriorRing === void 0) {
      const e = this.enclosingRing();
      this._isExteriorRing = e ? !e.isExteriorRing() : !0;
    }
    return this._isExteriorRing;
  }
  enclosingRing() {
    return this._enclosingRing === void 0 && (this._enclosingRing = this._calcEnclosingRing()), this._enclosingRing;
  }
  /* Returns the ring that encloses this one, if any */
  _calcEnclosingRing() {
    let e = this.events[0];
    for (let i = 1, o = this.events.length; i < o; i++) {
      const l = this.events[i];
      ae.compare(e, l) > 0 && (e = l);
    }
    let r = e.segment.prevInResult(), n = r ? r.prevInResult() : null;
    for (; ; ) {
      if (!r) return null;
      if (!n) return r.ringOut;
      if (n.ringOut !== r.ringOut)
        return n.ringOut?.enclosingRing() !== r.ringOut ? r.ringOut : r.ringOut?.enclosingRing();
      r = n.prevInResult(), n = r ? r.prevInResult() : null;
    }
  }
}, yt = class {
  exteriorRing;
  interiorRings;
  constructor(t) {
    this.exteriorRing = t, t.poly = this, this.interiorRings = [];
  }
  addInterior(t) {
    this.interiorRings.push(t), t.poly = this;
  }
  getGeom() {
    const t = this.exteriorRing.getGeom();
    if (t === null) return null;
    const e = [t];
    for (let r = 0, n = this.interiorRings.length; r < n; r++) {
      const i = this.interiorRings[r].getGeom();
      i !== null && e.push(i);
    }
    return e;
  }
}, or = class {
  rings;
  polys;
  constructor(t) {
    this.rings = t, this.polys = this._composePolys(t);
  }
  getGeom() {
    const t = [];
    for (let e = 0, r = this.polys.length; e < r; e++) {
      const n = this.polys[e].getGeom();
      n !== null && t.push(n);
    }
    return t;
  }
  _composePolys(t) {
    const e = [];
    for (let r = 0, n = t.length; r < n; r++) {
      const i = t[r];
      if (!i.poly)
        if (i.isExteriorRing()) e.push(new yt(i));
        else {
          const o = i.enclosingRing();
          o?.poly || e.push(new yt(o)), o?.poly?.addInterior(i);
        }
    }
    return e;
  }
}, lr = class {
  queue;
  tree;
  segments;
  constructor(t, e = Ue.compare) {
    this.queue = t, this.tree = new He(e), this.segments = [];
  }
  process(t) {
    const e = t.segment, r = [];
    if (t.consumedBy)
      return t.isLeft ? this.queue.delete(t.otherSE) : this.tree.delete(e), r;
    t.isLeft && this.tree.add(e);
    let n = e, i = e;
    do
      n = this.tree.lastBefore(n);
    while (n != null && n.consumedBy != null);
    do
      i = this.tree.firstAfter(i);
    while (i != null && i.consumedBy != null);
    if (t.isLeft) {
      let o = null;
      if (n) {
        const a = n.getIntersection(e);
        if (a !== null && (e.isAnEndpoint(a) || (o = a), !n.isAnEndpoint(a))) {
          const h = this._splitSafely(n, a);
          for (let c = 0, M = h.length; c < M; c++)
            r.push(h[c]);
        }
      }
      let l = null;
      if (i) {
        const a = i.getIntersection(e);
        if (a !== null && (e.isAnEndpoint(a) || (l = a), !i.isAnEndpoint(a))) {
          const h = this._splitSafely(i, a);
          for (let c = 0, M = h.length; c < M; c++)
            r.push(h[c]);
        }
      }
      if (o !== null || l !== null) {
        let a = null;
        o === null ? a = l : l === null ? a = o : a = ae.comparePoints(
          o,
          l
        ) <= 0 ? o : l, this.queue.delete(e.rightSE), r.push(e.rightSE);
        const h = e.split(a);
        for (let c = 0, M = h.length; c < M; c++)
          r.push(h[c]);
      }
      r.length > 0 ? (this.tree.delete(e), r.push(t)) : (this.segments.push(e), e.prev = n);
    } else {
      if (n && i) {
        const o = n.getIntersection(i);
        if (o !== null) {
          if (!n.isAnEndpoint(o)) {
            const l = this._splitSafely(n, o);
            for (let a = 0, h = l.length; a < h; a++)
              r.push(l[a]);
          }
          if (!i.isAnEndpoint(o)) {
            const l = this._splitSafely(i, o);
            for (let a = 0, h = l.length; a < h; a++)
              r.push(l[a]);
          }
        }
      }
      this.tree.delete(e);
    }
    return r;
  }
  /* Safely split a segment that is currently in the datastructures
   * IE - a segment other than the one that is currently being processed. */
  _splitSafely(t, e) {
    this.tree.delete(t);
    const r = t.rightSE;
    this.queue.delete(r);
    const n = t.split(e);
    return n.push(r), t.consumedBy === void 0 && this.tree.add(t), n;
  }
}, ur = class {
  type;
  numMultiPolys;
  run(t, e, r) {
    Le.type = t;
    const n = [new mt(e, !0)];
    for (let c = 0, M = r.length; c < M; c++)
      n.push(new mt(r[c], !1));
    if (Le.numMultiPolys = n.length, Le.type === "difference") {
      const c = n[0];
      let M = 1;
      for (; M < n.length; )
        it(n[M].bbox, c.bbox) !== null ? M++ : n.splice(M, 1);
    }
    if (Le.type === "intersection")
      for (let c = 0, M = n.length; c < M; c++) {
        const d = n[c];
        for (let P = c + 1, _ = n.length; P < _; P++)
          if (it(d.bbox, n[P].bbox) === null) return [];
      }
    const i = new He(ae.compare);
    for (let c = 0, M = n.length; c < M; c++) {
      const d = n[c].getSweepEvents();
      for (let P = 0, _ = d.length; P < _; P++)
        i.add(d[P]);
    }
    const o = new lr(i);
    let l = null;
    for (i.size != 0 && (l = i.first(), i.delete(l)); l; ) {
      const c = o.process(l);
      for (let M = 0, d = c.length; M < d; M++) {
        const P = c[M];
        P.consumedBy === void 0 && i.add(P);
      }
      i.size != 0 ? (l = i.first(), i.delete(l)) : l = null;
    }
    pe.reset();
    const a = sr.factory(o.segments);
    return new or(a).getGeom();
  }
}, Le = new ur(), ot = Le, ar = 0, Ue = class Ge {
  id;
  leftSE;
  rightSE;
  rings;
  windings;
  ringOut;
  consumedBy;
  prev;
  _prevInResult;
  _beforeState;
  _afterState;
  _isInResult;
  /* This compare() function is for ordering segments in the sweep
   * line tree, and does so according to the following criteria:
   *
   * Consider the vertical line that lies an infinestimal step to the
   * right of the right-more of the two left endpoints of the input
   * segments. Imagine slowly moving a point up from negative infinity
   * in the increasing y direction. Which of the two segments will that
   * point intersect first? That segment comes 'before' the other one.
   *
   * If neither segment would be intersected by such a line, (if one
   * or more of the segments are vertical) then the line to be considered
   * is directly on the right-more of the two left inputs.
   */
  static compare(e, r) {
    const n = e.leftSE.point.x, i = r.leftSE.point.x, o = e.rightSE.point.x, l = r.rightSE.point.x;
    if (l.isLessThan(n)) return 1;
    if (o.isLessThan(i)) return -1;
    const a = e.leftSE.point.y, h = r.leftSE.point.y, c = e.rightSE.point.y, M = r.rightSE.point.y;
    if (n.isLessThan(i)) {
      if (h.isLessThan(a) && h.isLessThan(c)) return 1;
      if (h.isGreaterThan(a) && h.isGreaterThan(c)) return -1;
      const d = e.comparePoint(r.leftSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
      const P = r.comparePoint(e.rightSE.point);
      return P !== 0 ? P : -1;
    }
    if (n.isGreaterThan(i)) {
      if (a.isLessThan(h) && a.isLessThan(M)) return -1;
      if (a.isGreaterThan(h) && a.isGreaterThan(M)) return 1;
      const d = r.comparePoint(e.leftSE.point);
      if (d !== 0) return d;
      const P = e.comparePoint(r.rightSE.point);
      return P < 0 ? 1 : P > 0 ? -1 : 1;
    }
    if (a.isLessThan(h)) return -1;
    if (a.isGreaterThan(h)) return 1;
    if (o.isLessThan(l)) {
      const d = r.comparePoint(e.rightSE.point);
      if (d !== 0) return d;
    }
    if (o.isGreaterThan(l)) {
      const d = e.comparePoint(r.rightSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
    }
    if (!o.eq(l)) {
      const d = c.minus(a), P = o.minus(n), _ = M.minus(h), b = l.minus(i);
      if (d.isGreaterThan(P) && _.isLessThan(b)) return 1;
      if (d.isLessThan(P) && _.isGreaterThan(b)) return -1;
    }
    return o.isGreaterThan(l) ? 1 : o.isLessThan(l) || c.isLessThan(M) ? -1 : c.isGreaterThan(M) ? 1 : e.id < r.id ? -1 : e.id > r.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, r, n, i) {
    this.id = ++ar, this.leftSE = e, e.segment = this, e.otherSE = r, this.rightSE = r, r.segment = this, r.otherSE = e, this.rings = n, this.windings = i;
  }
  static fromRing(e, r, n) {
    let i, o, l;
    const a = ae.comparePoints(e, r);
    if (a < 0)
      i = e, o = r, l = 1;
    else if (a > 0)
      i = r, o = e, l = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const h = new ae(i, !0), c = new ae(o, !1);
    return new Ge(h, c, [n], [l]);
  }
  /* When a segment is split, the rightSE is replaced with a new sweep event */
  replaceRightSE(e) {
    this.rightSE = e, this.rightSE.segment = this, this.rightSE.otherSE = this.leftSE, this.leftSE.otherSE = this.rightSE;
  }
  bbox() {
    const e = this.leftSE.point.y, r = this.rightSE.point.y;
    return {
      ll: { x: this.leftSE.point.x, y: e.isLessThan(r) ? e : r },
      ur: { x: this.rightSE.point.x, y: e.isGreaterThan(r) ? e : r }
    };
  }
  /* A vector from the left point to the right */
  vector() {
    return {
      x: this.rightSE.point.x.minus(this.leftSE.point.x),
      y: this.rightSE.point.y.minus(this.leftSE.point.y)
    };
  }
  isAnEndpoint(e) {
    return e.x.eq(this.leftSE.point.x) && e.y.eq(this.leftSE.point.y) || e.x.eq(this.rightSE.point.x) && e.y.eq(this.rightSE.point.y);
  }
  /* Compare this segment with a point.
   *
   * A point P is considered to be colinear to a segment if there
   * exists a distance D such that if we travel along the segment
   * from one * endpoint towards the other a distance D, we find
   * ourselves at point P.
   *
   * Return value indicates:
   *
   *   1: point lies above the segment (to the left of vertical)
   *   0: point is colinear to segment
   *  -1: point lies below the segment (to the right of vertical)
   */
  comparePoint(e) {
    return pe.orient(this.leftSE.point, e, this.rightSE.point);
  }
  /**
   * Given another segment, returns the first non-trivial intersection
   * between the two segments (in terms of sweep line ordering), if it exists.
   *
   * A 'non-trivial' intersection is one that will cause one or both of the
   * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
   *
   *   * endpoint of segA with endpoint of segB --> trivial
   *   * endpoint of segA with point along segB --> non-trivial
   *   * endpoint of segB with point along segA --> non-trivial
   *   * point along segA with point along segB --> non-trivial
   *
   * If no non-trivial intersection exists, return null
   * Else, return null.
   */
  getIntersection(e) {
    const r = this.bbox(), n = e.bbox(), i = it(r, n);
    if (i === null) return null;
    const o = this.leftSE.point, l = this.rightSE.point, a = e.leftSE.point, h = e.rightSE.point, c = Se(r, a) && this.comparePoint(a) === 0, M = Se(n, o) && e.comparePoint(o) === 0, d = Se(r, h) && this.comparePoint(h) === 0, P = Se(n, l) && e.comparePoint(l) === 0;
    if (M && c)
      return P && !d ? l : !P && d ? h : null;
    if (M)
      return d && o.x.eq(h.x) && o.y.eq(h.y) ? null : o;
    if (c)
      return P && l.x.eq(a.x) && l.y.eq(a.y) ? null : a;
    if (P && d) return null;
    if (P) return l;
    if (d) return h;
    const _ = ir(o, this.vector(), a, e.vector());
    return _ === null || !Se(i, _) ? null : pe.snap(_);
  }
  /**
   * Split the given segment into multiple segments on the given points.
   *  * Each existing segment will retain its leftSE and a new rightSE will be
   *    generated for it.
   *  * A new segment will be generated which will adopt the original segment's
   *    rightSE, and a new leftSE will be generated for it.
   *  * If there are more than two points given to split on, new segments
   *    in the middle will be generated with new leftSE and rightSE's.
   *  * An array of the newly generated SweepEvents will be returned.
   *
   * Warning: input array of points is modified
   */
  split(e) {
    const r = [], n = e.events !== void 0, i = new ae(e, !0), o = new ae(e, !1), l = this.rightSE;
    this.replaceRightSE(o), r.push(o), r.push(i);
    const a = new Ge(
      i,
      l,
      this.rings.slice(),
      this.windings.slice()
    );
    return ae.comparePoints(a.leftSE.point, a.rightSE.point) > 0 && a.swapEvents(), ae.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), n && (i.checkForConsuming(), o.checkForConsuming()), r;
  }
  /* Swap which event is left and right */
  swapEvents() {
    const e = this.rightSE;
    this.rightSE = this.leftSE, this.leftSE = e, this.leftSE.isLeft = !0, this.rightSE.isLeft = !1;
    for (let r = 0, n = this.windings.length; r < n; r++)
      this.windings[r] *= -1;
  }
  /* Consume another segment. We take their rings under our wing
   * and mark them as consumed. Use for perfectly overlapping segments */
  consume(e) {
    let r = this, n = e;
    for (; r.consumedBy; ) r = r.consumedBy;
    for (; n.consumedBy; ) n = n.consumedBy;
    const i = Ge.compare(r, n);
    if (i !== 0) {
      if (i > 0) {
        const o = r;
        r = n, n = o;
      }
      if (r.prev === n) {
        const o = r;
        r = n, n = o;
      }
      for (let o = 0, l = n.rings.length; o < l; o++) {
        const a = n.rings[o], h = n.windings[o], c = r.rings.indexOf(a);
        c === -1 ? (r.rings.push(a), r.windings.push(h)) : r.windings[c] += h;
      }
      n.rings = null, n.windings = null, n.consumedBy = r, n.leftSE.consumedBy = r.leftSE, n.rightSE.consumedBy = r.rightSE;
    }
  }
  /* The first segment previous segment chain that is in the result */
  prevInResult() {
    return this._prevInResult !== void 0 ? this._prevInResult : (this.prev ? this.prev.isInResult() ? this._prevInResult = this.prev : this._prevInResult = this.prev.prevInResult() : this._prevInResult = null, this._prevInResult);
  }
  beforeState() {
    if (this._beforeState !== void 0) return this._beforeState;
    if (!this.prev)
      this._beforeState = {
        rings: [],
        windings: [],
        multiPolys: []
      };
    else {
      const e = this.prev.consumedBy || this.prev;
      this._beforeState = e.afterState();
    }
    return this._beforeState;
  }
  afterState() {
    if (this._afterState !== void 0) return this._afterState;
    const e = this.beforeState();
    this._afterState = {
      rings: e.rings.slice(0),
      windings: e.windings.slice(0),
      multiPolys: []
    };
    const r = this._afterState.rings, n = this._afterState.windings, i = this._afterState.multiPolys;
    for (let a = 0, h = this.rings.length; a < h; a++) {
      const c = this.rings[a], M = this.windings[a], d = r.indexOf(c);
      d === -1 ? (r.push(c), n.push(M)) : n[d] += M;
    }
    const o = [], l = [];
    for (let a = 0, h = r.length; a < h; a++) {
      if (n[a] === 0) continue;
      const c = r[a], M = c.poly;
      if (l.indexOf(M) === -1)
        if (c.isExterior) o.push(M);
        else {
          l.indexOf(M) === -1 && l.push(M);
          const d = o.indexOf(c.poly);
          d !== -1 && o.splice(d, 1);
        }
    }
    for (let a = 0, h = o.length; a < h; a++) {
      const c = o[a].multiPoly;
      i.indexOf(c) === -1 && i.push(c);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const e = this.beforeState().multiPolys, r = this.afterState().multiPolys;
    switch (ot.type) {
      case "union": {
        const n = e.length === 0, i = r.length === 0;
        this._isInResult = n !== i;
        break;
      }
      case "intersection": {
        let n, i;
        e.length < r.length ? (n = e.length, i = r.length) : (n = r.length, i = e.length), this._isInResult = i === ot.numMultiPolys && n < i;
        break;
      }
      case "xor": {
        const n = Math.abs(e.length - r.length);
        this._isInResult = n % 2 === 1;
        break;
      }
      case "difference": {
        const n = (i) => i.length === 1 && i[0].isSubject;
        this._isInResult = n(e) !== n(r);
        break;
      }
    }
    return this._isInResult;
  }
}, dt = class {
  poly;
  isExterior;
  segments;
  bbox;
  constructor(t, e, r) {
    if (!Array.isArray(t) || t.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (this.poly = e, this.isExterior = r, this.segments = [], typeof t[0][0] != "number" || typeof t[0][1] != "number")
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const n = pe.snap({ x: new fe(t[0][0]), y: new fe(t[0][1]) });
    this.bbox = {
      ll: { x: n.x, y: n.y },
      ur: { x: n.x, y: n.y }
    };
    let i = n;
    for (let o = 1, l = t.length; o < l; o++) {
      if (typeof t[o][0] != "number" || typeof t[o][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const a = pe.snap({ x: new fe(t[o][0]), y: new fe(t[o][1]) });
      a.x.eq(i.x) && a.y.eq(i.y) || (this.segments.push(Ue.fromRing(i, a, this)), a.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = a.x), a.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = a.y), a.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = a.x), a.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = a.y), i = a);
    }
    (!n.x.eq(i.x) || !n.y.eq(i.y)) && this.segments.push(Ue.fromRing(i, n, this));
  }
  getSweepEvents() {
    const t = [];
    for (let e = 0, r = this.segments.length; e < r; e++) {
      const n = this.segments[e];
      t.push(n.leftSE), t.push(n.rightSE);
    }
    return t;
  }
}, fr = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(t, e) {
    if (!Array.isArray(t))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new dt(t[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let r = 1, n = t.length; r < n; r++) {
      const i = new dt(t[r], this, !1);
      i.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = i.bbox.ll.x), i.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = i.bbox.ll.y), i.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = i.bbox.ur.x), i.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = i.bbox.ur.y), this.interiorRings.push(i);
    }
    this.multiPoly = e;
  }
  getSweepEvents() {
    const t = this.exteriorRing.getSweepEvents();
    for (let e = 0, r = this.interiorRings.length; e < r; e++) {
      const n = this.interiorRings[e].getSweepEvents();
      for (let i = 0, o = n.length; i < o; i++)
        t.push(n[i]);
    }
    return t;
  }
}, mt = class {
  isSubject;
  polys;
  bbox;
  constructor(t, e) {
    if (!Array.isArray(t))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    try {
      typeof t[0][0][0] == "number" && (t = [t]);
    } catch {
    }
    this.polys = [], this.bbox = {
      ll: { x: new fe(Number.POSITIVE_INFINITY), y: new fe(Number.POSITIVE_INFINITY) },
      ur: { x: new fe(Number.NEGATIVE_INFINITY), y: new fe(Number.NEGATIVE_INFINITY) }
    };
    for (let r = 0, n = t.length; r < n; r++) {
      const i = new fr(t[r], this);
      i.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = i.bbox.ll.x), i.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = i.bbox.ll.y), i.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = i.bbox.ur.x), i.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = i.bbox.ur.y), this.polys.push(i);
    }
    this.isSubject = e;
  }
  getSweepEvents() {
    const t = [];
    for (let e = 0, r = this.polys.length; e < r; e++) {
      const n = this.polys[e].getSweepEvents();
      for (let i = 0, o = n.length; i < o; i++)
        t.push(n[i]);
    }
    return t;
  }
}, cr = (t, ...e) => ot.run("union", t, e);
pe.set;
var j = 63710088e-1, hr = {
  centimeters: j * 100,
  centimetres: j * 100,
  degrees: 360 / (2 * Math.PI),
  feet: j * 3.28084,
  inches: j * 39.37,
  kilometers: j / 1e3,
  kilometres: j / 1e3,
  meters: j,
  metres: j,
  miles: j / 1609.344,
  millimeters: j * 1e3,
  millimetres: j * 1e3,
  nauticalmiles: j / 1852,
  radians: 1,
  yards: j * 1.0936
};
function ge(t, e, r = {}) {
  const n = { type: "Feature" };
  return (r.id === 0 || r.id) && (n.id = r.id), r.bbox && (n.bbox = r.bbox), n.properties = e || {}, n.geometry = t, n;
}
function Ae(t, e, r = {}) {
  if (!t)
    throw new Error("coordinates is required");
  if (!Array.isArray(t))
    throw new Error("coordinates must be an Array");
  if (t.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!xt(t[0]) || !xt(t[1]))
    throw new Error("coordinates must contain numbers");
  return ge({
    type: "Point",
    coordinates: t
  }, e, r);
}
function pr(t, e, r = {}) {
  for (const i of t) {
    if (i.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (i[i.length - 1].length !== i[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let o = 0; o < i[i.length - 1].length; o++)
      if (i[i.length - 1][o] !== i[0][o])
        throw new Error("First and last Position are not equivalent.");
  }
  return ge({
    type: "Polygon",
    coordinates: t
  }, e, r);
}
function wt(t, e, r = {}) {
  if (t.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return ge({
    type: "LineString",
    coordinates: t
  }, e, r);
}
function ve(t, e = {}) {
  const r = { type: "FeatureCollection" };
  return e.id && (r.id = e.id), e.bbox && (r.bbox = e.bbox), r.features = t, r;
}
function gr(t, e, r = {}) {
  return ge({
    type: "MultiPolygon",
    coordinates: t
  }, e, r);
}
function yr(t, e = "kilometers") {
  const r = hr[e];
  if (!r)
    throw new Error(e + " units is invalid");
  return t * r;
}
function ke(t) {
  return t % 360 * Math.PI / 180;
}
function xt(t) {
  return !isNaN(t) && t !== null && !Array.isArray(t);
}
function dr(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function _e(t, e, r) {
  if (t !== null)
    for (var n, i, o, l, a, h, c, M = 0, d = 0, P, _ = t.type, b = _ === "FeatureCollection", L = _ === "Feature", O = b ? t.features.length : 1, A = 0; A < O; A++) {
      c = b ? (
        // @ts-expect-error: Known type conflict
        t.features[A].geometry
      ) : L ? (
        // @ts-expect-error: Known type conflict
        t.geometry
      ) : t, P = c ? c.type === "GeometryCollection" : !1, a = P ? c.geometries.length : 1;
      for (var w = 0; w < a; w++) {
        var R = 0, F = 0;
        if (l = P ? c.geometries[w] : c, l !== null) {
          h = l.coordinates;
          var T = l.type;
          switch (M = 0, T) {
            case null:
              break;
            case "Point":
              if (
                // @ts-expect-error: Known type conflict
                e(
                  h,
                  d,
                  A,
                  R,
                  F
                ) === !1
              )
                return !1;
              d++, R++;
              break;
            case "LineString":
            case "MultiPoint":
              for (n = 0; n < h.length; n++) {
                if (
                  // @ts-expect-error: Known type conflict
                  e(
                    h[n],
                    d,
                    A,
                    R,
                    F
                  ) === !1
                )
                  return !1;
                d++, T === "MultiPoint" && R++;
              }
              T === "LineString" && R++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (n = 0; n < h.length; n++) {
                for (i = 0; i < h[n].length - M; i++) {
                  if (
                    // @ts-expect-error: Known type conflict
                    e(
                      h[n][i],
                      d,
                      A,
                      R,
                      F
                    ) === !1
                  )
                    return !1;
                  d++;
                }
                T === "MultiLineString" && R++, T === "Polygon" && F++;
              }
              T === "Polygon" && R++;
              break;
            case "MultiPolygon":
              for (n = 0; n < h.length; n++) {
                for (F = 0, i = 0; i < h[n].length; i++) {
                  for (o = 0; o < h[n][i].length - M; o++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      e(
                        h[n][i][o],
                        d,
                        A,
                        R,
                        F
                      ) === !1
                    )
                      return !1;
                    d++;
                  }
                  F++;
                }
                R++;
              }
              break;
            case "GeometryCollection":
              for (n = 0; n < l.geometries.length; n++)
                if (
                  // @ts-expect-error: Known type conflict
                  _e(l.geometries[n], e) === !1
                )
                  return !1;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }
}
function at(t, e) {
  if (t.type === "Feature")
    e(t, 0);
  else if (t.type === "FeatureCollection")
    for (var r = 0; r < t.features.length && e(t.features[r], r) !== !1; r++)
      ;
}
function ft(t, e) {
  var r, n, i, o, l, a, h, c, M, d, P = 0, _ = t.type === "FeatureCollection", b = t.type === "Feature", L = _ ? t.features.length : 1;
  for (r = 0; r < L; r++) {
    for (a = _ ? (
      // @ts-expect-error: Known type conflict
      t.features[r].geometry
    ) : b ? (
      // @ts-expect-error: Known type conflict
      t.geometry
    ) : t, c = _ ? (
      // @ts-expect-error: Known type conflict
      t.features[r].properties
    ) : b ? (
      // @ts-expect-error: Known type conflict
      t.properties
    ) : {}, M = _ ? (
      // @ts-expect-error: Known type conflict
      t.features[r].bbox
    ) : b ? (
      // @ts-expect-error: Known type conflict
      t.bbox
    ) : void 0, d = _ ? (
      // @ts-expect-error: Known type conflict
      t.features[r].id
    ) : b ? (
      // @ts-expect-error: Known type conflict
      t.id
    ) : void 0, h = a ? a.type === "GeometryCollection" : !1, l = h ? a.geometries.length : 1, i = 0; i < l; i++) {
      if (o = h ? a.geometries[i] : a, o === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            P,
            c,
            M,
            d
          ) === !1
        )
          return !1;
        continue;
      }
      switch (o.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            // @ts-expect-error: Known type conflict
            e(
              o,
              P,
              c,
              M,
              d
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (n = 0; n < o.geometries.length; n++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                o.geometries[n],
                P,
                c,
                M,
                d
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    P++;
  }
}
function mr(t, e) {
  ft(t, function(r, n, i, o, l) {
    var a = r === null ? null : r.type;
    switch (a) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            ge(r, i, { bbox: o, id: l }),
            n,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var h;
    switch (a) {
      case "MultiPoint":
        h = "Point";
        break;
      case "MultiLineString":
        h = "LineString";
        break;
      case "MultiPolygon":
        h = "Polygon";
        break;
    }
    for (
      var c = 0;
      // @ts-expect-error: Known type conflict
      c < r.coordinates.length;
      c++
    ) {
      var M = r.coordinates[c], d = {
        type: h,
        coordinates: M
      };
      if (
        // @ts-expect-error: Known type conflict
        e(ge(d, i), n, c) === !1
      )
        return !1;
    }
  });
}
function wr(t, e = {}) {
  const r = [];
  if (ft(t, (i) => {
    r.push(i.coordinates);
  }), r.length < 2)
    throw new Error("Must have at least 2 geometries");
  const n = cr(r[0], ...r.slice(1));
  return n.length === 0 ? null : n.length === 1 ? pr(n[0], e.properties) : gr(n, e.properties);
}
function xr(t) {
  var e = {
    MultiPoint: {
      coordinates: [],
      properties: []
    },
    MultiLineString: {
      coordinates: [],
      properties: []
    },
    MultiPolygon: {
      coordinates: [],
      properties: []
    }
  };
  return at(t, (r) => {
    var n;
    switch ((n = r.geometry) == null ? void 0 : n.type) {
      case "Point":
        e.MultiPoint.coordinates.push(r.geometry.coordinates), e.MultiPoint.properties.push(r.properties);
        break;
      case "MultiPoint":
        e.MultiPoint.coordinates.push(...r.geometry.coordinates), e.MultiPoint.properties.push(r.properties);
        break;
      case "LineString":
        e.MultiLineString.coordinates.push(r.geometry.coordinates), e.MultiLineString.properties.push(r.properties);
        break;
      case "MultiLineString":
        e.MultiLineString.coordinates.push(
          ...r.geometry.coordinates
        ), e.MultiLineString.properties.push(r.properties);
        break;
      case "Polygon":
        e.MultiPolygon.coordinates.push(r.geometry.coordinates), e.MultiPolygon.properties.push(r.properties);
        break;
      case "MultiPolygon":
        e.MultiPolygon.coordinates.push(...r.geometry.coordinates), e.MultiPolygon.properties.push(r.properties);
        break;
    }
  }), ve(
    Object.keys(e).filter(function(r) {
      return e[r].coordinates.length;
    }).sort().map(function(r) {
      var n = { type: r, coordinates: e[r].coordinates }, i = { collectedProperties: e[r].properties };
      return ge(n, i);
    })
  );
}
function Fe(t) {
  if (!t) throw new Error("geojson is required");
  var e = [];
  return mr(t, function(r) {
    e.push(r);
  }), ve(e);
}
class vr {
  constructor(e = [], r = (n, i) => n < i ? -1 : n > i ? 1 : 0) {
    if (this.data = e, this.length = this.data.length, this.compare = r, this.length > 0)
      for (let n = (this.length >> 1) - 1; n >= 0; n--) this._down(n);
  }
  push(e) {
    this.data.push(e), this._up(this.length++);
  }
  pop() {
    if (this.length === 0) return;
    const e = this.data[0], r = this.data.pop();
    return --this.length > 0 && (this.data[0] = r, this._down(0)), e;
  }
  peek() {
    return this.data[0];
  }
  _up(e) {
    const { data: r, compare: n } = this, i = r[e];
    for (; e > 0; ) {
      const o = e - 1 >> 1, l = r[o];
      if (n(i, l) >= 0) break;
      r[e] = l, e = o;
    }
    r[e] = i;
  }
  _down(e) {
    const { data: r, compare: n } = this, i = this.length >> 1, o = r[e];
    for (; e < i; ) {
      let l = (e << 1) + 1;
      const a = l + 1;
      if (a < this.length && n(r[a], r[l]) < 0 && (l = a), n(r[l], o) >= 0) break;
      r[e] = r[l], e = l;
    }
    r[e] = o;
  }
}
function br(t, e = 1, r = !1) {
  let n = 1 / 0, i = 1 / 0, o = -1 / 0, l = -1 / 0;
  for (const [A, w] of t[0])
    A < n && (n = A), w < i && (i = w), A > o && (o = A), w > l && (l = w);
  const a = o - n, h = l - i, c = Math.max(e, Math.min(a, h));
  if (c === e) {
    const A = [n, i];
    return A.distance = 0, A;
  }
  const M = new vr([], (A, w) => w.max - A.max);
  let d = Sr(t);
  const P = new ze(n + a / 2, i + h / 2, 0, t);
  P.d > d.d && (d = P);
  let _ = 2;
  function b(A, w, R) {
    const F = new ze(A, w, R, t);
    _++, F.max > d.d + e && M.push(F), F.d > d.d && (d = F, r && console.log(\`found best \${Math.round(1e4 * F.d) / 1e4} after \${_} probes\`));
  }
  let L = c / 2;
  for (let A = n; A < o; A += c)
    for (let w = i; w < l; w += c)
      b(A + L, w + L, L);
  for (; M.length; ) {
    const { max: A, x: w, y: R, h: F } = M.pop();
    if (A - d.d <= e) break;
    L = F / 2, b(w - L, R - L, L), b(w + L, R - L, L), b(w - L, R + L, L), b(w + L, R + L, L);
  }
  r && console.log(\`num probes: \${_}
best distance: \${d.d}\`);
  const O = [d.x, d.y];
  return O.distance = d.d, O;
}
function ze(t, e, r, n) {
  this.x = t, this.y = e, this.h = r, this.d = Er(t, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function Er(t, e, r) {
  let n = !1, i = 1 / 0;
  for (const o of r)
    for (let l = 0, a = o.length, h = a - 1; l < a; h = l++) {
      const c = o[l], M = o[h];
      c[1] > e != M[1] > e && t < (M[0] - c[0]) * (e - c[1]) / (M[1] - c[1]) + c[0] && (n = !n), i = Math.min(i, Pr(t, e, c, M));
    }
  return i === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(i);
}
function Sr(t) {
  let e = 0, r = 0, n = 0;
  const i = t[0];
  for (let l = 0, a = i.length, h = a - 1; l < a; h = l++) {
    const c = i[l], M = i[h], d = c[0] * M[1] - M[0] * c[1];
    r += (c[0] + M[0]) * d, n += (c[1] + M[1]) * d, e += d * 3;
  }
  const o = new ze(r / e, n / e, 0, t);
  return e === 0 || o.d < 0 ? new ze(i[0][0], i[0][1], 0, t) : o;
}
function Pr(t, e, r, n) {
  let i = r[0], o = r[1], l = n[0] - i, a = n[1] - o;
  if (l !== 0 || a !== 0) {
    const h = ((t - i) * l + (e - o) * a) / (l * l + a * a);
    h > 1 ? (i = n[0], o = n[1]) : h > 0 && (i += l * h, o += a * h);
  }
  return l = t - i, a = e - o, l * l + a * a;
}
function Mr(t) {
  const e = [];
  return t.type === "FeatureCollection" ? at(t, function(r) {
    _e(r, function(n) {
      e.push(Ae(n, r.properties));
    });
  }) : t.type === "Feature" ? _e(t, function(r) {
    e.push(Ae(r, t.properties));
  }) : _e(t, function(r) {
    e.push(Ae(r));
  }), ve(e);
}
function Lr(t, e = {}) {
  if (t.bbox != null && e.recompute !== !0)
    return t.bbox;
  const r = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return _e(t, (n) => {
    r[0] > n[0] && (r[0] = n[0]), r[1] > n[1] && (r[1] = n[1]), r[2] < n[0] && (r[2] = n[0]), r[3] < n[1] && (r[3] = n[1]);
  }), r;
}
function Ar(t, e = {}) {
  const r = Lr(t), n = (r[0] + r[2]) / 2, i = (r[1] + r[3]) / 2;
  return Ae([n, i], e.properties, e);
}
function Dt(t) {
  if (!t)
    throw new Error("geojson is required");
  switch (t.type) {
    case "Feature":
      return Ut(t);
    case "FeatureCollection":
      return _r(t);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return ct(t);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function Ut(t) {
  const e = { type: "Feature" };
  return Object.keys(t).forEach((r) => {
    switch (r) {
      case "type":
      case "properties":
      case "geometry":
        return;
      default:
        e[r] = t[r];
    }
  }), e.properties = zt(t.properties), t.geometry == null ? e.geometry = null : e.geometry = ct(t.geometry), e;
}
function zt(t) {
  const e = {};
  return t && Object.keys(t).forEach((r) => {
    const n = t[r];
    typeof n == "object" ? n === null ? e[r] = null : Array.isArray(n) ? e[r] = n.map((i) => i) : e[r] = zt(n) : e[r] = n;
  }), e;
}
function _r(t) {
  const e = { type: "FeatureCollection" };
  return Object.keys(t).forEach((r) => {
    switch (r) {
      case "type":
      case "features":
        return;
      default:
        e[r] = t[r];
    }
  }), e.features = t.features.map((r) => Ut(r)), e;
}
function ct(t) {
  const e = { type: t.type };
  return t.bbox && (e.bbox = t.bbox), t.type === "GeometryCollection" ? (e.geometries = t.geometries.map((r) => ct(r)), e) : (e.coordinates = Kt(t.coordinates), e);
}
function Kt(t) {
  const e = t;
  return typeof e[0] != "object" ? e.slice() : e.map((r) => Kt(r));
}
function Ke(t) {
  if (!t)
    throw new Error("coord is required");
  if (!Array.isArray(t)) {
    if (t.type === "Feature" && t.geometry !== null && t.geometry.type === "Point")
      return [...t.geometry.coordinates];
    if (t.type === "Point")
      return [...t.coordinates];
  }
  if (Array.isArray(t) && t.length >= 2 && !Array.isArray(t[0]) && !Array.isArray(t[1]))
    return [...t];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function Oe(t) {
  if (Array.isArray(t))
    return t;
  if (t.type === "Feature") {
    if (t.geometry !== null)
      return t.geometry.coordinates;
  } else if (t.coordinates)
    return t.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function Or(t) {
  return t.type === "Feature" ? t.geometry : t;
}
function Nr(t, e) {
  return t.type === "FeatureCollection" ? "FeatureCollection" : t.type === "GeometryCollection" ? "GeometryCollection" : t.type === "Feature" && t.geometry !== null ? t.geometry.type : t.type;
}
function Tr(t, e, r = {}) {
  var n = Ke(t), i = Ke(e), o = ke(i[1] - n[1]), l = ke(i[0] - n[0]), a = ke(n[1]), h = ke(i[1]), c = Math.pow(Math.sin(o / 2), 2) + Math.pow(Math.sin(l / 2), 2) * Math.cos(a) * Math.cos(h);
  return yr(
    2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c)),
    r.units
  );
}
var Cr = Object.defineProperty, Rr = Object.defineProperties, kr = Object.getOwnPropertyDescriptors, vt = Object.getOwnPropertySymbols, Fr = Object.prototype.hasOwnProperty, Br = Object.prototype.propertyIsEnumerable, bt = (t, e, r) => e in t ? Cr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, Et = (t, e) => {
  for (var r in e || (e = {}))
    Fr.call(e, r) && bt(t, r, e[r]);
  if (vt)
    for (var r of vt(e))
      Br.call(e, r) && bt(t, r, e[r]);
  return t;
}, St = (t, e) => Rr(t, kr(e));
function Ir(t, e, r = {}) {
  if (!t) throw new Error("targetPoint is required");
  if (!e) throw new Error("points is required");
  let n = 1 / 0, i = 0;
  at(e, (l, a) => {
    const h = Tr(t, l, r);
    h < n && (i = a, n = h);
  });
  const o = Dt(e.features[i]);
  return St(Et({}, o), {
    properties: St(Et({}, o.properties), {
      featureIndex: i,
      distanceToPoint: n
    })
  });
}
const he = 11102230246251565e-32, J = 134217729, Gr = (3 + 8 * he) * he;
function Qe(t, e, r, n, i) {
  let o, l, a, h, c = e[0], M = n[0], d = 0, P = 0;
  M > c == M > -c ? (o = c, c = e[++d]) : (o = M, M = n[++P]);
  let _ = 0;
  if (d < t && P < r)
    for (M > c == M > -c ? (l = c + o, a = o - (l - c), c = e[++d]) : (l = M + o, a = o - (l - M), M = n[++P]), o = l, a !== 0 && (i[_++] = a); d < t && P < r; )
      M > c == M > -c ? (l = o + c, h = l - o, a = o - (l - h) + (c - h), c = e[++d]) : (l = o + M, h = l - o, a = o - (l - h) + (M - h), M = n[++P]), o = l, a !== 0 && (i[_++] = a);
  for (; d < t; )
    l = o + c, h = l - o, a = o - (l - h) + (c - h), c = e[++d], o = l, a !== 0 && (i[_++] = a);
  for (; P < r; )
    l = o + M, h = l - o, a = o - (l - h) + (M - h), M = n[++P], o = l, a !== 0 && (i[_++] = a);
  return (o !== 0 || _ === 0) && (i[_++] = o), _;
}
function qr(t, e) {
  let r = e[0];
  for (let n = 1; n < t; n++) r += e[n];
  return r;
}
function Ne(t) {
  return new Float64Array(t);
}
const Hr = (3 + 16 * he) * he, Dr = (2 + 12 * he) * he, Ur = (9 + 64 * he) * he * he, me = Ne(4), Pt = Ne(8), Mt = Ne(12), Lt = Ne(16), Z = Ne(4);
function zr(t, e, r, n, i, o, l) {
  let a, h, c, M, d, P, _, b, L, O, A, w, R, F, T, C, k, s;
  const u = t - i, f = r - i, x = e - o, p = n - o;
  F = u * p, P = J * u, _ = P - (P - u), b = u - _, P = J * p, L = P - (P - p), O = p - L, T = b * O - (F - _ * L - b * L - _ * O), C = x * f, P = J * x, _ = P - (P - x), b = x - _, P = J * f, L = P - (P - f), O = f - L, k = b * O - (C - _ * L - b * L - _ * O), A = T - k, d = T - A, me[0] = T - (A + d) + (d - k), w = F + A, d = w - F, R = F - (w - d) + (A - d), A = R - C, d = R - A, me[1] = R - (A + d) + (d - C), s = w + A, d = s - w, me[2] = w - (s - d) + (A - d), me[3] = s;
  let y = qr(4, me), v = Dr * l;
  if (y >= v || -y >= v || (d = t - u, a = t - (u + d) + (d - i), d = r - f, c = r - (f + d) + (d - i), d = e - x, h = e - (x + d) + (d - o), d = n - p, M = n - (p + d) + (d - o), a === 0 && h === 0 && c === 0 && M === 0) || (v = Ur * l + Gr * Math.abs(y), y += u * M + p * a - (x * c + f * h), y >= v || -y >= v)) return y;
  F = a * p, P = J * a, _ = P - (P - a), b = a - _, P = J * p, L = P - (P - p), O = p - L, T = b * O - (F - _ * L - b * L - _ * O), C = h * f, P = J * h, _ = P - (P - h), b = h - _, P = J * f, L = P - (P - f), O = f - L, k = b * O - (C - _ * L - b * L - _ * O), A = T - k, d = T - A, Z[0] = T - (A + d) + (d - k), w = F + A, d = w - F, R = F - (w - d) + (A - d), A = R - C, d = R - A, Z[1] = R - (A + d) + (d - C), s = w + A, d = s - w, Z[2] = w - (s - d) + (A - d), Z[3] = s;
  const g = Qe(4, me, 4, Z, Pt);
  F = u * M, P = J * u, _ = P - (P - u), b = u - _, P = J * M, L = P - (P - M), O = M - L, T = b * O - (F - _ * L - b * L - _ * O), C = x * c, P = J * x, _ = P - (P - x), b = x - _, P = J * c, L = P - (P - c), O = c - L, k = b * O - (C - _ * L - b * L - _ * O), A = T - k, d = T - A, Z[0] = T - (A + d) + (d - k), w = F + A, d = w - F, R = F - (w - d) + (A - d), A = R - C, d = R - A, Z[1] = R - (A + d) + (d - C), s = w + A, d = s - w, Z[2] = w - (s - d) + (A - d), Z[3] = s;
  const m = Qe(g, Pt, 4, Z, Mt);
  F = a * M, P = J * a, _ = P - (P - a), b = a - _, P = J * M, L = P - (P - M), O = M - L, T = b * O - (F - _ * L - b * L - _ * O), C = h * c, P = J * h, _ = P - (P - h), b = h - _, P = J * c, L = P - (P - c), O = c - L, k = b * O - (C - _ * L - b * L - _ * O), A = T - k, d = T - A, Z[0] = T - (A + d) + (d - k), w = F + A, d = w - F, R = F - (w - d) + (A - d), A = R - C, d = R - A, Z[1] = R - (A + d) + (d - C), s = w + A, d = s - w, Z[2] = w - (s - d) + (A - d), Z[3] = s;
  const S = Qe(m, Mt, 4, Z, Lt);
  return Lt[S - 1];
}
function Kr(t, e, r, n, i, o) {
  const l = (e - o) * (r - i), a = (t - i) * (n - o), h = l - a, c = Math.abs(l + a);
  return Math.abs(h) >= Hr * c ? h : -zr(t, e, r, n, i, o, c);
}
function Vr(t, e) {
  var r, n, i = 0, o, l, a, h, c, M, d, P = t[0], _ = t[1], b = e.length;
  for (r = 0; r < b; r++) {
    n = 0;
    var L = e[r], O = L.length - 1;
    if (M = L[0], M[0] !== L[O][0] && M[1] !== L[O][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (l = M[0] - P, a = M[1] - _, n; n < O; n++) {
      if (d = L[n + 1], h = d[0] - P, c = d[1] - _, a === 0 && c === 0) {
        if (h <= 0 && l >= 0 || l <= 0 && h >= 0)
          return 0;
      } else if (c >= 0 && a <= 0 || c <= 0 && a >= 0) {
        if (o = Kr(l, h, a, c, 0, 0), o === 0)
          return 0;
        (o > 0 && c > 0 && a <= 0 || o < 0 && c <= 0 && a > 0) && i++;
      }
      M = d, a = c, l = h;
    }
  }
  return i % 2 !== 0;
}
function $r(t, e, r = {}) {
  if (!t)
    throw new Error("point is required");
  if (!e)
    throw new Error("polygon is required");
  const n = Ke(t), i = Or(e), o = i.type, l = e.bbox;
  let a = i.coordinates;
  if (l && Xr(n, l) === !1)
    return !1;
  o === "Polygon" && (a = [a]);
  let h = !1;
  for (var c = 0; c < a.length; ++c) {
    const M = Vr(n, a[c]);
    if (M === 0) return !r.ignoreBoundary;
    M && (h = !0);
  }
  return h;
}
function Xr(t, e) {
  return e[0] <= t[0] && e[1] <= t[1] && e[2] >= t[0] && e[3] >= t[1];
}
function At(t) {
  const e = Yr(t), r = Ar(e);
  let n = !1, i = 0;
  for (; !n && i < e.features.length; ) {
    const o = e.features[i].geometry;
    let l, a, h, c, M, d, P = !1;
    if (o.type === "Point")
      r.geometry.coordinates[0] === o.coordinates[0] && r.geometry.coordinates[1] === o.coordinates[1] && (n = !0);
    else if (o.type === "MultiPoint") {
      let _ = !1, b = 0;
      for (; !_ && b < o.coordinates.length; )
        r.geometry.coordinates[0] === o.coordinates[b][0] && r.geometry.coordinates[1] === o.coordinates[b][1] && (n = !0, _ = !0), b++;
    } else if (o.type === "LineString") {
      let _ = 0;
      for (; !P && _ < o.coordinates.length - 1; )
        l = r.geometry.coordinates[0], a = r.geometry.coordinates[1], h = o.coordinates[_][0], c = o.coordinates[_][1], M = o.coordinates[_ + 1][0], d = o.coordinates[_ + 1][1], _t(l, a, h, c, M, d) && (P = !0, n = !0), _++;
    } else if (o.type === "MultiLineString") {
      let _ = 0;
      for (; _ < o.coordinates.length; ) {
        P = !1;
        let b = 0;
        const L = o.coordinates[_];
        for (; !P && b < L.length - 1; )
          l = r.geometry.coordinates[0], a = r.geometry.coordinates[1], h = L[b][0], c = L[b][1], M = L[b + 1][0], d = L[b + 1][1], _t(l, a, h, c, M, d) && (P = !0, n = !0), b++;
        _++;
      }
    } else (o.type === "Polygon" || o.type === "MultiPolygon") && $r(r, o) && (n = !0);
    i++;
  }
  if (n)
    return r;
  {
    const o = ve([]);
    for (let l = 0; l < e.features.length; l++)
      o.features = o.features.concat(
        Mr(e.features[l]).features
      );
    return Ae(Ir(r, o).geometry.coordinates);
  }
}
function Yr(t) {
  return t.type !== "FeatureCollection" ? t.type !== "Feature" ? ve([ge(t)]) : ve([t]) : t;
}
function _t(t, e, r, n, i, o) {
  const l = Math.sqrt((i - r) * (i - r) + (o - n) * (o - n)), a = Math.sqrt((t - r) * (t - r) + (e - n) * (e - n)), h = Math.sqrt((i - t) * (i - t) + (o - e) * (o - e));
  return l === a + h;
}
function Ot(t, e, r = {}) {
  const n = Ke(t), i = Oe(e);
  for (let o = 0; o < i.length - 1; o++) {
    let l = !1;
    if (r.ignoreEndVertices && (o === 0 && (l = "start"), o === i.length - 2 && (l = "end"), o === 0 && o + 1 === i.length - 1 && (l = "both")), Jr(
      i[o],
      i[o + 1],
      n,
      l,
      typeof r.epsilon > "u" ? null : r.epsilon
    ))
      return !0;
  }
  return !1;
}
function Jr(t, e, r, n, i) {
  const o = r[0], l = r[1], a = t[0], h = t[1], c = e[0], M = e[1], d = r[0] - a, P = r[1] - h, _ = c - a, b = M - h, L = d * b - P * _;
  if (i !== null) {
    if (Math.abs(L) > i)
      return !1;
  } else if (L !== 0)
    return !1;
  if (Math.abs(_) === Math.abs(b) && Math.abs(_) === 0)
    return n ? !1 : r[0] === t[0] && r[1] === t[1];
  if (n) {
    if (n === "start")
      return Math.abs(_) >= Math.abs(b) ? _ > 0 ? a < o && o <= c : c <= o && o < a : b > 0 ? h < l && l <= M : M <= l && l < h;
    if (n === "end")
      return Math.abs(_) >= Math.abs(b) ? _ > 0 ? a <= o && o < c : c < o && o <= a : b > 0 ? h <= l && l < M : M < l && l <= h;
    if (n === "both")
      return Math.abs(_) >= Math.abs(b) ? _ > 0 ? a < o && o < c : c < o && o < a : b > 0 ? h < l && l < M : M < l && l < h;
  } else return Math.abs(_) >= Math.abs(b) ? _ > 0 ? a <= o && o <= c : c <= o && o <= a : b > 0 ? h <= l && l <= M : M <= l && l <= h;
  return !1;
}
function Wr(t, e = {}) {
  var r = typeof e == "object" ? e.mutate : e;
  if (!t) throw new Error("geojson is required");
  var n = Nr(t), i = [];
  switch (n) {
    case "LineString":
      i = je(t, n);
      break;
    case "MultiLineString":
    case "Polygon":
      Oe(t).forEach(function(l) {
        i.push(je(l, n));
      });
      break;
    case "MultiPolygon":
      Oe(t).forEach(function(l) {
        var a = [];
        l.forEach(function(h) {
          a.push(je(h, n));
        }), i.push(a);
      });
      break;
    case "Point":
      return t;
    case "MultiPoint":
      var o = {};
      Oe(t).forEach(function(l) {
        var a = l.join("-");
        Object.prototype.hasOwnProperty.call(o, a) || (i.push(l), o[a] = !0);
      });
      break;
    default:
      throw new Error(n + " geometry not supported");
  }
  return t.coordinates ? r === !0 ? (t.coordinates = i, t) : { type: n, coordinates: i } : r === !0 ? (t.geometry.coordinates = i, t) : ge({ type: n, coordinates: i }, t.properties, {
    bbox: t.bbox,
    id: t.id
  });
}
function je(t, e) {
  const r = Oe(t);
  if (r.length === 2 && !Nt(r[0], r[1])) return r;
  const n = [];
  let i = 0, o = 1, l = 2;
  for (n.push(r[i]); l < r.length; )
    Ot(r[o], wt([r[i], r[l]])) ? o = l : (n.push(r[o]), i = o, o++, l = o), l++;
  if (n.push(r[o]), e === "Polygon" || e === "MultiPolygon") {
    if (Ot(
      n[0],
      wt([n[1], n[n.length - 2]])
    ) && (n.shift(), n.pop(), n.push(n[0])), n.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!Nt(n[0], n[n.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return n;
}
function Nt(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}
function Zr(t, e) {
  var r = t[0] - e[0], n = t[1] - e[1];
  return r * r + n * n;
}
function Qr(t, e, r) {
  var n = e[0], i = e[1], o = r[0] - n, l = r[1] - i;
  if (o !== 0 || l !== 0) {
    var a = ((t[0] - n) * o + (t[1] - i) * l) / (o * o + l * l);
    a > 1 ? (n = r[0], i = r[1]) : a > 0 && (n += o * a, i += l * a);
  }
  return o = t[0] - n, l = t[1] - i, o * o + l * l;
}
function jr(t, e) {
  for (var r = t[0], n = [r], i, o = 1, l = t.length; o < l; o++)
    i = t[o], Zr(i, r) > e && (n.push(i), r = i);
  return r !== i && n.push(i), n;
}
function lt(t, e, r, n, i) {
  for (var o = n, l, a = e + 1; a < r; a++) {
    var h = Qr(t[a], t[e], t[r]);
    h > o && (l = a, o = h);
  }
  o > n && (l - e > 1 && lt(t, e, l, n, i), i.push(t[l]), r - l > 1 && lt(t, l, r, n, i));
}
function en(t, e) {
  var r = t.length - 1, n = [t[0]];
  return lt(t, 0, r, e, n), n.push(t[r]), n;
}
function Ve(t, e, r) {
  if (t.length <= 2) return t;
  var n = e !== void 0 ? e * e : 1;
  return t = r ? t : jr(t, n), t = en(t, n), t;
}
function Tt(t, e = {}) {
  var r, n, i;
  if (e = e ?? {}, !dr(e)) throw new Error("options is invalid");
  const o = (r = e.tolerance) != null ? r : 1, l = (n = e.highQuality) != null ? n : !1, a = (i = e.mutate) != null ? i : !1;
  if (!t) throw new Error("geojson is required");
  if (o && o < 0) throw new Error("invalid tolerance");
  return a !== !0 && (t = Dt(t)), ft(t, function(h) {
    tn(h, o, l);
  }), t;
}
function tn(t, e, r) {
  const n = t.type;
  if (n === "Point" || n === "MultiPoint") return t;
  if (Wr(t, { mutate: !0 }), n !== "GeometryCollection")
    switch (n) {
      case "LineString":
        t.coordinates = Ve(
          t.coordinates,
          e,
          r
        );
        break;
      case "MultiLineString":
        t.coordinates = t.coordinates.map(
          (i) => Ve(i, e, r)
        );
        break;
      case "Polygon":
        t.coordinates = Ct(
          t.coordinates,
          e,
          r
        );
        break;
      case "MultiPolygon":
        t.coordinates = t.coordinates.map(
          (i) => Ct(i, e, r)
        );
    }
  return t;
}
function Ct(t, e, r) {
  return t.map(function(n) {
    if (n.length < 4)
      throw new Error("invalid polygon");
    let i = e, o = Ve(n, i, r);
    for (; !Rt(o) && i >= Number.EPSILON; )
      i -= i * 0.01, o = Ve(n, i, r);
    return Rt(o) ? ((o[o.length - 1][0] !== o[0][0] || o[o.length - 1][1] !== o[0][1]) && o.push(o[0]), o) : n;
  });
}
function Rt(t) {
  return t.length < 3 ? !1 : !(t.length === 3 && t[2][0] === t[0][0] && t[2][1] === t[0][1]);
}
class $e {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  static _nextPow2(e) {
    return e <= 0 ? 0 : (e = e - 1 >>> 0, e |= e >> 1, e |= e >> 2, e |= e >> 4, e |= e >> 8, e |= e >> 16, e + 1 >>> 0);
  }
  rent(e) {
    const r = $e._nextPow2(e || 1), n = this.map.get(r);
    return n && n.length ? n.pop() : new ArrayBuffer(r);
  }
  release(e) {
    if (!e || !e.byteLength) return;
    const r = $e._nextPow2(e.byteLength);
    let n = this.map.get(r);
    n || (n = [], this.map.set(r, n)), n.push(e);
  }
}
const ut = new TextEncoder(), Vt = new TextDecoder(), kt = { keys: [], index: /* @__PURE__ */ new Map() };
let ue = !1;
function Be(t, e = {}) {
  const r = [], n = [], i = [], o = !!e.useSharedKeyTable;
  let l, a;
  o ? (l = kt.keys, a = kt.index) : (l = [], a = /* @__PURE__ */ new Map());
  let h = 0, c = 0;
  const M = (L) => {
    if (Array.isArray(L)) {
      const O = Number(L[0]), A = Number(L[1]);
      n.push(Number.isFinite(O) ? O : 0, Number.isFinite(A) ? A : 0);
    } else if (L && (typeof L.x == "number" || typeof L.y == "number")) {
      const O = Number(L.x), A = Number(L.y);
      n.push(Number.isFinite(O) ? O : 0, Number.isFinite(A) ? A : 0);
    } else
      n.push(0, 0);
  };
  for (const L of t) {
    const O = L.id == null ? "" : String(L.id), A = L.geometry || {}, w = A.type || "Unknown", R = { id: O, type: w, coordsOffset: h, coordsLength: 0 };
    if (w === "Point") {
      const C = A.coordinates || [];
      M(C), R.coordsLength = 2;
    } else if (w === "LineString" || w === "MultiPoint") {
      const C = A.coordinates || [];
      for (const k of C) M(k);
      R.coordsLength = (C.length || 0) * 2;
    } else if (w === "Polygon") {
      const C = A.coordinates || [];
      R.ringLengths = [];
      for (const k of C) {
        R.ringLengths.push(k.length || 0);
        for (const s of k) M(s);
      }
      R.coordsLength = R.ringLengths.reduce((k, s) => k + s, 0) * 2;
    } else if (w === "MultiPolygon") {
      const C = A.coordinates || [];
      R.polygonRingCounts = [], R.ringLengths = [];
      for (const k of C) {
        R.polygonRingCounts.push(k.length || 0);
        for (const s of k) {
          R.ringLengths.push(s.length || 0);
          for (const u of s) M(u);
        }
      }
      R.coordsLength = R.ringLengths.reduce((k, s) => k + s, 0) * 2;
    } else
      R.coordsLength = 0;
    const F = L.properties || {}, T = [];
    for (const C of Object.keys(F)) {
      let k = a.get(C);
      k === void 0 && (k = l.length, l.push(C), a.set(C, k));
      const s = JSON.stringify(F[C]), u = ut.encode(s);
      i.push(u), T.push([k, c, u.length]), c += u.length;
    }
    R.props = T, h += R.coordsLength, r.push(R);
  }
  let d;
  if (e.propsBuffer)
    e.propsBuffer instanceof Uint8Array ? d = e.propsBuffer.subarray(0, c) : d = new Uint8Array(e.propsBuffer, 0, c), d.byteLength < c && (d = new Uint8Array(c));
  else if (e.pool && c > 0) {
    const L = e.pool.rent(c);
    d = new Uint8Array(L, 0, c);
  } else
    d = new Uint8Array(c);
  let P = 0;
  for (const L of i)
    d.set(L, P), P += L.length;
  const _ = n.length;
  let b;
  if (e.coordsBuffer)
    e.coordsBuffer instanceof ArrayBuffer ? b = new Float32Array(e.coordsBuffer, 0, _) : e.coordsBuffer instanceof Float32Array ? b = e.coordsBuffer.subarray(0, _) : b = new Float32Array(_), b.length < _ && (b = new Float32Array(_));
  else if (e.pool && _ > 0) {
    const L = e.pool.rent(_ * 4);
    b = new Float32Array(L, 0, _);
  } else
    b = new Float32Array(_);
  return b.length > 0 && b.set(n), { meta: r, keys: l, propsBuffer: d, coordsArray: b };
}
function rn(t, e, r, n) {
  const i = r instanceof Float32Array ? r : new Float32Array(r), o = e instanceof Uint8Array ? e : e ? new Uint8Array(e) : new Uint8Array(0), l = [];
  for (let a = 0; a < (t.length || 0); a++) {
    const h = t[a] || {}, c = h.id, M = {};
    if (Array.isArray(h.props) && h.props.length && n && n.length)
      for (const O of h.props) {
        const [A, w, R] = O;
        try {
          const F = o.subarray(w, w + R);
          M[n[A]] = JSON.parse(Vt.decode(F));
        } catch {
        }
      }
    const d = h.type || "Unknown";
    let P = h.coordsOffset || 0;
    const _ = P + (h.coordsLength || 0);
    let b = null;
    if (d === "Point") {
      const O = i[P], A = i[P + 1], w = Number.isFinite(O) ? Math.max(-180, Math.min(180, O)) : 0, R = Number.isFinite(A) ? Math.max(-90, Math.min(90, A)) : 0;
      if ((!Number.isFinite(O) || !Number.isFinite(A)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value", { index: a, id: c, rawX: O, rawY: A });
        } catch {
        }
      }
      b = { type: "Point", coordinates: [w, R] };
    } else if (d === "LineString" || d === "MultiPoint") {
      const O = [];
      for (; P < _; P += 2) {
        const A = i[P], w = i[P + 1], R = Number.isFinite(A) ? Math.max(-180, Math.min(180, A)) : 0, F = Number.isFinite(w) ? Math.max(-90, Math.min(90, w)) : 0;
        if ((!Number.isFinite(A) || !Number.isFinite(w)) && !ue) {
          ue = !0;
          try {
            console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value", { index: a, id: c, rawX: A, rawY: w });
          } catch {
          }
        }
        O.push([R, F]);
      }
      b = { type: d, coordinates: O };
    } else if (d === "Polygon") {
      const O = [], A = h.ringLengths || [];
      for (const w of A) {
        const R = [];
        for (let F = 0; F < w; F++) {
          const T = i[P], C = i[P + 1], k = Number.isFinite(T) ? Math.max(-180, Math.min(180, T)) : 0, s = Number.isFinite(C) ? Math.max(-90, Math.min(90, C)) : 0;
          if ((!Number.isFinite(T) || !Number.isFinite(C)) && !ue) {
            ue = !0;
            try {
              console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value", { index: a, id: c, rawX: T, rawY: C });
            } catch {
            }
          }
          R.push([k, s]), P += 2;
        }
        O.push(R);
      }
      b = { type: "Polygon", coordinates: O };
    } else if (d === "MultiPolygon") {
      const O = [], A = h.polygonRingCounts || [], w = h.ringLengths || [];
      let R = 0;
      for (const F of A) {
        const T = [];
        for (let C = 0; C < F; C++) {
          const k = w[R++] || 0, s = [];
          for (let u = 0; u < k; u++) {
            const f = i[P], x = i[P + 1], p = Number.isFinite(f) ? Math.max(-180, Math.min(180, f)) : 0, y = Number.isFinite(x) ? Math.max(-90, Math.min(90, x)) : 0;
            if ((!Number.isFinite(f) || !Number.isFinite(x)) && !ue) {
              ue = !0;
              try {
                console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value", { index: a, id: c, rawX: f, rawY: x });
              } catch {
              }
            }
            s.push([p, y]), P += 2;
          }
          T.push(s);
        }
        O.push(T);
      }
      b = { type: "MultiPolygon", coordinates: O };
    } else if (P < _) {
      const O = i[P], A = i[P + 1], w = Number.isFinite(O) ? Math.max(-180, Math.min(180, O)) : 0, R = Number.isFinite(A) ? Math.max(-90, Math.min(90, A)) : 0;
      if ((!Number.isFinite(O) || !Number.isFinite(A)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value", { index: a, id: c, rawX: O, rawY: A });
        } catch {
        }
      }
      b = { type: "Point", coordinates: [w, R] };
    }
    b == null && (b = { type: "Point", coordinates: [0, 0] });
    const L = M && typeof M == "object" ? M : {};
    l.push({ type: "Feature", id: c, geometry: b, properties: L });
  }
  return l;
}
const Pe = new $e(), z = /* @__PURE__ */ new Map();
let et = 1e4, we = null;
const nn = (t, e) => {
  try {
    const r = t && t.geometry && t.geometry.coordinates;
    let n = br(r, e);
    return (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1])) && (n = At(t).geometry.coordinates), {
      type: "Point",
      coordinates: [n[0], n[1]]
    };
  } catch {
    return console.log("Invalid feature geometry", t && t.id), At(t).geometry;
  }
}, sn = new ArrayBuffer(8), tt = new DataView(sn), on = new ArrayBuffer(4), Ft = new DataView(on);
function $t() {
  return 2166136261;
}
function ie(t, e) {
  return t ^= e >>> 0, t = Math.imul(t, 16777619) >>> 0, t;
}
function ln(t, e) {
  const r = Number(e) || 0;
  return tt.setFloat64(0, r, !0), t = ie(t, tt.getUint32(0, !0)), t = ie(t, tt.getUint32(4, !0)), t;
}
function oe(t, e) {
  const r = Number(e) || 0;
  return Ft.setFloat32(0, r, !0), t = ie(t, Ft.getUint32(0, !0)), t;
}
function qe(t, e) {
  if (!e) return t;
  for (let r = 0; r < e.length; r++) {
    const n = e.charCodeAt(r);
    t = ie(t, n & 65535);
  }
  return t;
}
function xe(t) {
  if (!t) return 0;
  let e = $t();
  e = qe(e, t.type || "");
  const r = t.type;
  if (r === "Point") {
    const n = t.coordinates || [];
    return e = oe(e, n[0]), e = oe(e, n[1]), e;
  }
  if (r === "LineString" || r === "MultiPoint") {
    const n = t.coordinates || [];
    for (const i of n)
      e = oe(e, i && i[0]), e = oe(e, i && i[1]);
    return e;
  }
  if (r === "Polygon") {
    const n = t.coordinates || [];
    e = ie(e, n.length);
    for (const i of n) {
      e = ie(e, i.length || 0);
      for (const o of i)
        e = oe(e, o && o[0]), e = oe(e, o && o[1]);
    }
    return e;
  }
  if (r === "MultiPolygon") {
    const n = t.coordinates || [];
    e = ie(e, n.length);
    for (const i of n) {
      e = ie(e, i.length || 0);
      for (const o of i) {
        e = ie(e, o.length || 0);
        for (const l of o)
          e = oe(e, l && l[0]), e = oe(e, l && l[1]);
      }
    }
    return e;
  }
  try {
    const n = t.coordinates || [];
    for (const i of n)
      Array.isArray(i) ? (e = oe(e, i[0]), e = oe(e, i[1])) : e = oe(e, i);
  } catch {
  }
  return e;
}
function Xt(t, e, r = 1e-6) {
  if (typeof t == "number" && typeof e == "number") return Math.abs(t - e) <= r;
  if (Array.isArray(t) && Array.isArray(e)) {
    if (t.length !== e.length) return !1;
    for (let n = 0; n < t.length; n++)
      if (!Xt(t[n], e[n], r)) return !1;
    return !0;
  }
  return !1;
}
function un(t, e) {
  return !t && !e ? !0 : !t || !e || t.type !== e.type ? !1 : Xt(t.coordinates, e.coordinates);
}
function an(t) {
  let e = $t();
  e = ie(e, t.length || 0);
  for (const r of t) {
    if (e = qe(e, r && r.id != null ? String(r.id) : ""), r && r.geometry) {
      const n = r.__inGeomHash !== void 0 ? r.__inGeomHash : xe(r.geometry);
      e = ie(e, n);
    }
    if (r && r.properties)
      for (const n of Object.keys(r.properties)) {
        e = qe(e, n);
        const i = r.properties[n];
        i == null ? e = ie(e, 0) : typeof i == "number" ? e = ln(e, i) : e = qe(e, String(i));
      }
  }
  return e;
}
onmessage = (t) => {
  let e = t && t.data;
  if (e && e.type === "diff_ack") {
    try {
      if (we) {
        for (const b of we.addList || []) {
          const L = b && (b.feature || b);
          if (L && L.id != null)
            try {
              const O = b && b.geomHash !== void 0 ? b.geomHash : xe(L.geometry), A = b && b.rawHash !== void 0 ? b.rawHash : O;
              z.set(String(L.id), { feature: L, geomHash: O, rawHash: A, ts: Date.now() });
            } catch {
              z.set(String(L.id), { feature: L, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const b of we.updateList || []) {
          const L = b && (b.feature || b);
          if (L && L.id != null)
            try {
              const O = b && b.geomHash !== void 0 ? b.geomHash : xe(L.geometry), A = b && b.rawHash !== void 0 ? b.rawHash : O;
              z.set(String(L.id), { feature: L, geomHash: O, rawHash: A, ts: Date.now() });
            } catch {
              z.set(String(L.id), { feature: L, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const b of we.removeList || [])
          try {
            z.delete(String(b));
          } catch {
          }
        for (; z.size > et; ) {
          const b = z.keys().next();
          if (b.done) break;
          z.delete(b.value);
        }
        we = null;
      }
    } catch {
    }
    return;
  }
  if (e && e.type === "request_full") {
    try {
      const b = Array.from(z.values()).map((R) => R.feature), { meta: L, keys: O, propsBuffer: A, coordsArray: w } = Be(b || [], { pool: Pe, useSharedKeyTable: !0 });
      postMessage({ type: "geojson_bin", meta: L, keys: O, propsBuf: A.buffer, coords: w.buffer }, [A.buffer, w.buffer]);
    } catch {
    }
    return;
  }
  if (e && e.type === "features" && e.payload)
    try {
      const b = e.payload instanceof Uint8Array ? e.payload.buffer : e.payload, L = Vt.decode(b);
      e = JSON.parse(L);
    } catch {
      e = {};
    }
  if (e && e.type === "features_bin" && e.coords)
    try {
      const b = e.meta || [], L = e.propsBuf !== void 0 ? e.propsBuf : null, O = e.coords, A = e.keys || [], w = rn(b, L, O, A), R = t.data && t.data.hashes ? t.data.hashes : null;
      if (R && Array.isArray(w))
        for (const F of w)
          try {
            const T = String(F && F.id != null ? F.id : ""), C = R[T];
            C !== void 0 && (F.__inGeomHash = C);
          } catch {
          }
      e = { features: w, tolerance: t.data && t.data.tolerance, promoteId: t.data && t.data.promoteId, _receivedPropsBuf: L, _receivedCoordsBuf: O, _receivedKeys: A, _receivedHashes: R, cacheSize: t.data && t.data.cacheSize };
    } catch {
      e = e || {};
    }
  const r = e || {}, n = r.features || [], i = r.tolerance || 1e-5, o = !0, l = /* @__PURE__ */ new Map();
  for (const b of n) {
    const L = b.id, O = l.get(L) || [];
    O.push(b), l.set(L, O);
  }
  const a = { type: "FeatureCollection", features: [] }, h = [], c = [], M = /* @__PURE__ */ new Set(), d = [], P = /* @__PURE__ */ new Map();
  for (const [b, L] of l.entries()) {
    const O = String(b), A = an(L), w = z.get(O);
    if (w && w.rawHash === A) {
      d.push(w.feature);
      continue;
    }
    const { clipped: R, ...F } = L[0] && L[0].properties || {};
    let T;
    if (L.length === 1) {
      const s = L[0].geometry;
      let u = { type: "Feature", id: b, geometry: s, properties: F };
      s.type === "MultiPolygon" ? T = Fe(u) : T = { type: "FeatureCollection", features: [u] }, T = Tt(T, { tolerance: i, mutate: o });
    } else
      T = { type: "FeatureCollection", features: L.map((s) => ({ type: "Feature", id: b, geometry: s.geometry, properties: F })) }, T.features.some((s) => s.geometry.type === "MultiPolygon") && (T = Fe(T)), T = Tt(T, { tolerance: i, mutate: o }), L.some((s) => s.properties && s.properties.clipped) && (T = wr(T)), T.type === "Feature" ? T.geometry.type === "MultiPolygon" ? T = Fe(T) : T = { type: "FeatureCollection", features: [T] } : T.features.some((s) => s.geometry.type === "MultiPolygon") && (T = Fe(T));
    T.features = T.features.map((s) => (s.id = b, s.geometry.type === "Polygon" ? s.geometry = nn(s, i) : console.log("Unexpected geometry type after union/simplify/flatten for id:" + b + " - type:" + s.geometry.type), s)), T = xr(T);
    const C = { type: "Feature", id: b, geometry: T.features[0].geometry, properties: F }, k = xe(C.geometry);
    if (!w)
      h.push(C);
    else if (k !== (w.geomHash || 0))
      try {
        un(C.geometry, w.feature.geometry) || (c.push(C), M.add(O));
      } catch {
        c.push(C), M.add(O);
      }
    P.set(O, { feature: C, rawHash: A, geomHash: k }), d.push(C);
  }
  const _ = r.promoteId;
  if (_)
    for (const b of d)
      b.properties || (b.properties = {}), b.id != null && (b.properties[_] === void 0 || b.properties[_] === null) && (b.properties[_] = b.id);
  try {
    e && typeof e.cacheSize == "number" && e.cacheSize > 0 && (et = e.cacheSize);
    const b = d && d.length ? d : a.features || [];
    if (z.size === 0) {
      for (const [u, f] of P.entries())
        try {
          z.set(u, { feature: f.feature, geomHash: f.geomHash, rawHash: f.rawHash, ts: Date.now() });
        } catch {
          z.set(u, { feature: f.feature, geomHash: f.geomHash || 0, rawHash: f.rawHash || 0, ts: Date.now() });
        }
      const { meta: T, keys: C, propsBuffer: k, coordsArray: s } = Be(b || [], { pool: Pe });
      postMessage({ type: "geojson_bin", meta: T, keys: C, propsBuf: k.buffer, coords: s.buffer }, [k.buffer, s.buffer]);
      return;
    }
    const L = h.length;
    let O = Math.max(0, z.size + L - et);
    const A = [];
    if (O > 0) {
      for (const T of z.keys()) {
        if (A.length >= O) break;
        if (M.has(T)) continue;
        const C = z.get(T);
        A.push(C && C.feature && C.feature.id != null ? C.feature.id : T);
      }
      if (A.length < O)
        for (const T of z.keys()) {
          if (A.length >= O) break;
          if (A.includes(T)) continue;
          const C = z.get(T);
          A.push(C && C.feature && C.feature.id != null ? C.feature.id : T);
        }
    }
    if (h.length === 0 && c.length === 0 && A.length === 0)
      return;
    const w = c.map((T) => {
      const C = { id: T.id };
      T.geometry && (C.newGeometry = T.geometry);
      const k = z.get(String(T.id)), s = k && k.feature && k.feature.properties ? k.feature.properties : {}, u = T.properties || {}, f = Object.keys(s), x = Object.keys(u);
      if (x.length === 0 && f.length > 0)
        C.removeAllProperties = !0;
      else {
        const y = f.filter((v) => !(v in u));
        y.length && (C.removeProperties = y);
      }
      const p = x.filter((y) => u[y] !== s[y]).map((y) => ({ key: y, value: u[y] }));
      return p.length && (C.addOrUpdateProperties = p), C;
    }), R = h.map((T) => {
      const C = P.get(String(T.id));
      if (C) return { feature: C.feature, rawHash: C.rawHash, geomHash: C.geomHash };
      try {
        const k = xe(T.geometry);
        return { feature: T, rawHash: k, geomHash: k };
      } catch {
        return { feature: T, rawHash: 0, geomHash: 0 };
      }
    }), F = c.map((T) => {
      const C = P.get(String(T.id));
      if (C) return { feature: C.feature, rawHash: C.rawHash, geomHash: C.geomHash };
      try {
        const k = xe(T.geometry);
        return { feature: T, rawHash: k, geomHash: k };
      } catch {
        return { feature: T, rawHash: 0, geomHash: 0 };
      }
    });
    we = { addList: R, updateList: F, removeList: A };
    try {
      const T = { type: "geojson_diff_bin" };
      A.length && (z.size > 0 && A.length >= z.size ? T.removeAll = !0 : T.removeList = A);
      const C = [];
      if (h.length) {
        const { meta: k, keys: s, propsBuffer: u, coordsArray: f } = Be(h || [], { pool: Pe, useSharedKeyTable: !0 });
        T.add = { meta: k, keys: s, propsBuf: u.buffer, coords: f.buffer }, u && u.buffer && C.push(u.buffer), f && f.buffer && C.push(f.buffer);
      }
      if (c.length) {
        const { meta: k, keys: s, propsBuffer: u, coordsArray: f } = Be(c || [], { pool: Pe, useSharedKeyTable: !0 });
        T.update = { meta: k, keys: s, propsBuf: u.buffer, coords: f.buffer }, u && u.buffer && C.push(u.buffer), f && f.buffer && C.push(f.buffer);
      }
      if (w.length) {
        const k = [], s = /* @__PURE__ */ new Map(), u = [];
        let f = 0;
        const x = w.map((y) => {
          const v = { id: y.id };
          return y.removeAllProperties && (v.removeAllProperties = !0), Array.isArray(y.removeProperties) && y.removeProperties.length && (v.removeProperties = y.removeProperties.map((g) => {
            let m = s.get(g);
            return m === void 0 && (m = k.length, k.push(g), s.set(g, m)), m;
          })), Array.isArray(y.addOrUpdateProperties) && y.addOrUpdateProperties.length && (v.addOrUpdate = y.addOrUpdateProperties.map((g) => {
            const m = g.key;
            let S = s.get(m);
            S === void 0 && (S = k.length, k.push(m), s.set(m, S));
            const E = JSON.stringify(g.value), N = ut.encode(E);
            u.push(N);
            const B = f, I = N.length;
            return f += I, [S, B, I];
          })), v;
        });
        let p = null;
        if (f > 0) {
          const y = Pe.rent(f || 1);
          p = new Uint8Array(y, 0, f);
          let v = 0;
          for (const g of u)
            p.set(g, v), v += g.length;
        } else
          p = new Uint8Array(0);
        T.updateDiffsMeta = x, T.updateKeys = k, p && p.buffer && p.byteLength && (T.updatePropsBuf = p.buffer, C.push(p.buffer));
      }
      postMessage(T, C);
      return;
    } catch {
      try {
        const C = {};
        A.length && (z.size > 0 && A.length >= z.size ? C.removeAll = !0 : C.remove = A), h.length && (C.add = h), w.length && (C.update = w), postMessage({ type: "geojson_diff", diff: C });
        return;
      } catch {
      }
    }
    return;
  } catch {
    try {
      const L = JSON.stringify(a), O = ut.encode(L);
      postMessage({ type: "geojson", payload: O.buffer }, [O.buffer]);
    } catch {
      postMessage(a);
    }
  }
};
`,vn=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",An],{type:"text/javascript;charset=utf-8"});function fe(r){let n;try{if(n=vn&&(self.URL||self.webkitURL).createObjectURL(vn),!n)throw"";const e=new Worker(n,{type:"module",name:r?.name});return e.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(n)}),e}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(An),{type:"module",name:r?.name})}}class X{constructor(){this.map=new Map}static _nextPow2(n){return n<=0?0:(n=n-1>>>0,n|=n>>1,n|=n>>2,n|=n>>4,n|=n>>8,n|=n>>16,n+1>>>0)}rent(n){const e=X._nextPow2(n||1),s=this.map.get(e);return s&&s.length?s.pop():new ArrayBuffer(e)}release(n){if(!n||!n.byteLength)return;const e=X._nextPow2(n.byteLength);let s=this.map.get(e);s||(s=[],this.map.set(e,s)),s.push(n)}}const Ln=new TextEncoder,an=new TextDecoder,Sn={keys:[],index:new Map};let O=!1;function ce(r,n={}){const e=[],s=[],i=[],u=!!n.useSharedKeyTable;let l,c;u?(l=Sn.keys,c=Sn.index):(l=[],c=new Map);let d=0,g=0;const x=w=>{if(Array.isArray(w)){const m=Number(w[0]),b=Number(w[1]);s.push(Number.isFinite(m)?m:0,Number.isFinite(b)?b:0)}else if(w&&(typeof w.x=="number"||typeof w.y=="number")){const m=Number(w.x),b=Number(w.y);s.push(Number.isFinite(m)?m:0,Number.isFinite(b)?b:0)}else s.push(0,0)};for(const w of r){const m=w.id==null?"":String(w.id),b=w.geometry||{},F=b.type||"Unknown",P={id:m,type:F,coordsOffset:d,coordsLength:0};if(F==="Point"){const E=b.coordinates||[];x(E),P.coordsLength=2}else if(F==="LineString"||F==="MultiPoint"){const E=b.coordinates||[];for(const M of E)x(M);P.coordsLength=(E.length||0)*2}else if(F==="Polygon"){const E=b.coordinates||[];P.ringLengths=[];for(const M of E){P.ringLengths.push(M.length||0);for(const k of M)x(k)}P.coordsLength=P.ringLengths.reduce((M,k)=>M+k,0)*2}else if(F==="MultiPolygon"){const E=b.coordinates||[];P.polygonRingCounts=[],P.ringLengths=[];for(const M of E){P.polygonRingCounts.push(M.length||0);for(const k of M){P.ringLengths.push(k.length||0);for(const N of k)x(N)}}P.coordsLength=P.ringLengths.reduce((M,k)=>M+k,0)*2}else P.coordsLength=0;const _=w.properties||{},L=[];for(const E of Object.keys(_)){let M=c.get(E);M===void 0&&(M=l.length,l.push(E),c.set(E,M));const k=JSON.stringify(_[E]),N=Ln.encode(k);i.push(N),L.push([M,g,N.length]),g+=N.length}P.props=L,d+=P.coordsLength,e.push(P)}let y;if(n.propsBuffer)n.propsBuffer instanceof Uint8Array?y=n.propsBuffer.subarray(0,g):y=new Uint8Array(n.propsBuffer,0,g),y.byteLength<g&&(y=new Uint8Array(g));else if(n.pool&&g>0){const w=n.pool.rent(g);y=new Uint8Array(w,0,g)}else y=new Uint8Array(g);let o=0;for(const w of i)y.set(w,o),o+=w.length;const f=s.length;let p;if(n.coordsBuffer)n.coordsBuffer instanceof ArrayBuffer?p=new Float32Array(n.coordsBuffer,0,f):n.coordsBuffer instanceof Float32Array?p=n.coordsBuffer.subarray(0,f):p=new Float32Array(f),p.length<f&&(p=new Float32Array(f));else if(n.pool&&f>0){const w=n.pool.rent(f*4);p=new Float32Array(w,0,f)}else p=new Float32Array(f);return p.length>0&&p.set(s),{meta:e,keys:l,propsBuffer:y,coordsArray:p}}function on(r,n,e,s){const i=e instanceof Float32Array?e:new Float32Array(e),u=n instanceof Uint8Array?n:n?new Uint8Array(n):new Uint8Array(0),l=[];for(let c=0;c<(r.length||0);c++){const d=r[c]||{},g=d.id,x={};if(Array.isArray(d.props)&&d.props.length&&s&&s.length)for(const m of d.props){const[b,F,P]=m;try{const _=u.subarray(F,F+P);x[s[b]]=JSON.parse(an.decode(_))}catch{}}const y=d.type||"Unknown";let o=d.coordsOffset||0;const f=o+(d.coordsLength||0);let p=null;if(y==="Point"){const m=i[o],b=i[o+1],F=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,P=Number.isFinite(b)?Math.max(-90,Math.min(90,b)):0;if((!Number.isFinite(m)||!Number.isFinite(b))&&!O){O=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value",{index:c,id:g,rawX:m,rawY:b})}catch{}}p={type:"Point",coordinates:[F,P]}}else if(y==="LineString"||y==="MultiPoint"){const m=[];for(;o<f;o+=2){const b=i[o],F=i[o+1],P=Number.isFinite(b)?Math.max(-180,Math.min(180,b)):0,_=Number.isFinite(F)?Math.max(-90,Math.min(90,F)):0;if((!Number.isFinite(b)||!Number.isFinite(F))&&!O){O=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value",{index:c,id:g,rawX:b,rawY:F})}catch{}}m.push([P,_])}p={type:y,coordinates:m}}else if(y==="Polygon"){const m=[],b=d.ringLengths||[];for(const F of b){const P=[];for(let _=0;_<F;_++){const L=i[o],E=i[o+1],M=Number.isFinite(L)?Math.max(-180,Math.min(180,L)):0,k=Number.isFinite(E)?Math.max(-90,Math.min(90,E)):0;if((!Number.isFinite(L)||!Number.isFinite(E))&&!O){O=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value",{index:c,id:g,rawX:L,rawY:E})}catch{}}P.push([M,k]),o+=2}m.push(P)}p={type:"Polygon",coordinates:m}}else if(y==="MultiPolygon"){const m=[],b=d.polygonRingCounts||[],F=d.ringLengths||[];let P=0;for(const _ of b){const L=[];for(let E=0;E<_;E++){const M=F[P++]||0,k=[];for(let N=0;N<M;N++){const G=i[o],D=i[o+1],t=Number.isFinite(G)?Math.max(-180,Math.min(180,G)):0,a=Number.isFinite(D)?Math.max(-90,Math.min(90,D)):0;if((!Number.isFinite(G)||!Number.isFinite(D))&&!O){O=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value",{index:c,id:g,rawX:G,rawY:D})}catch{}}k.push([t,a]),o+=2}L.push(k)}m.push(L)}p={type:"MultiPolygon",coordinates:m}}else if(o<f){const m=i[o],b=i[o+1],F=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,P=Number.isFinite(b)?Math.max(-90,Math.min(90,b)):0;if((!Number.isFinite(m)||!Number.isFinite(b))&&!O){O=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value",{index:c,id:g,rawX:m,rawY:b})}catch{}}p={type:"Point",coordinates:[F,P]}}p==null&&(p={type:"Point",coordinates:[0,0]});const w=x&&typeof x=="object"?x:{};l.push({type:"Feature",id:g,geometry:p,properties:w})}return l}const de=new ArrayBuffer(4),Pn=new DataView(de);function pe(){return 2166136261}function I(r,n){return r^=n>>>0,r=Math.imul(r,16777619)>>>0,r}function B(r,n){const e=Number(n)||0;return Pn.setFloat32(0,e,!0),r=I(r,Pn.getUint32(0,!0)),r}function ge(r,n){if(!n)return r;for(let e=0;e<n.length;e++){const s=n.charCodeAt(e);r=I(r,s&65535)}return r}function J(r){if(!r)return 0;let n=pe();n=ge(n,r.type||"");const e=r.type;if(e==="Point"){const s=r.coordinates||[];return n=B(n,s[0]),n=B(n,s[1]),n}if(e==="LineString"||e==="MultiPoint"){const s=r.coordinates||[];for(const i of s)n=B(n,i&&i[0]),n=B(n,i&&i[1]);return n}if(e==="Polygon"){const s=r.coordinates||[];n=I(n,s.length);for(const i of s){n=I(n,i.length||0);for(const u of i)n=B(n,u&&u[0]),n=B(n,u&&u[1])}return n}if(e==="MultiPolygon"){const s=r.coordinates||[];n=I(n,s.length);for(const i of s){n=I(n,i.length||0);for(const u of i){n=I(n,u.length||0);for(const l of u)n=B(n,l&&l[0]),n=B(n,l&&l[1])}}return n}try{const s=r.coordinates||[];for(const i of s)Array.isArray(i)?(n=B(n,i[0]),n=B(n,i[1])):n=B(n,i)}catch{}return n}class kn{constructor(n){return this.map=n.map,this.source=n.source instanceof maplibregl.VectorTileSource?n.source:this.map.getSource(n.source),this.sourceLayer=n.sourceLayer,this.fid=n.fid||"id",this.tiles=this.source.tiles.map(e=>e.split("{z}")[0]),this.tileSize=this.source.tileSize||512,this.tolerance=n.tolerance||1e-5,this.cacheSize=n.cacheSize||1e4,this.minion=new fe,this._abPool=new X,this._lastGeomHashes=new Map,this.minion.onmessage=e=>{const s=e&&e.data;if(s)if(s.type==="geojson_bin"&&s.coords)try{const i=s.coords instanceof Uint8Array?s.coords.buffer:s.coords,u=s.propsBuf!==void 0?s.propsBuf:null,l=on(s.meta||[],u,i,s.keys||[]);this.gjsource.setData({type:"FeatureCollection",features:l});try{for(const c of l)if(c&&c.id!=null)try{this._lastGeomHashes.set(String(c.id),J(c.geometry))}catch{this._lastGeomHashes.set(String(c.id),0)}}catch{}try{u&&this._abPool.release(u instanceof ArrayBuffer?u:u.buffer)}catch{}try{i&&this._abPool.release(i instanceof ArrayBuffer?i:i.buffer)}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch(i){console.warn("Failed to decode binary worker response",i)}else if(s.type==="geojson_diff")try{const i=s&&s.diff?s.diff:{};if(this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(i);try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process geojson diff from worker",i)}else if(s.type==="geojson_diff_bin")try{const i=s.removeList||[],u=!!s.removeAll;let l=[];if(s.add&&s.add.coords)try{const o=s.add.propsBuf!==void 0?s.add.propsBuf:null,f=s.add.coords;l=on(s.add.meta||[],o,f,s.add.keys||[]);try{o&&this._abPool.release(o instanceof ArrayBuffer?o:o.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode add-list from worker",o);try{this.minion.postMessage({type:"request_full"})}catch{}return}let c=[];if(s.update&&s.update.coords)try{const o=s.update.propsBuf!==void 0?s.update.propsBuf:null,f=s.update.coords;c=on(s.update.meta||[],o,f,s.update.keys||[]);try{o&&this._abPool.release(o instanceof ArrayBuffer?o:o.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode update-list from worker",o);try{this.minion.postMessage({type:"request_full"})}catch{}return}let d=[];if(s.updateDiffs&&Array.isArray(s.updateDiffs))d=s.updateDiffs;else if(s.updateDiffsMeta&&Array.isArray(s.updateDiffsMeta))try{const o=s.updateKeys||[],f=s.updatePropsBuf!==void 0?s.updatePropsBuf:null,p=f?f instanceof Uint8Array?f:new Uint8Array(f):new Uint8Array(0),w=an;for(const m of s.updateDiffsMeta){const b={id:m.id};if(m.removeAllProperties&&(b.removeAllProperties=!0),Array.isArray(m.removeProperties)&&m.removeProperties.length&&(b.removeProperties=m.removeProperties.map(F=>o[F])),Array.isArray(m.addOrUpdate)&&m.addOrUpdate.length){const F=[];for(const P of m.addOrUpdate){const[_,L,E]=P,M=o[_];try{const k=p.subarray(L,L+E),N=JSON.parse(w.decode(k));F.push({key:M,value:N})}catch{}}F.length&&(b.addOrUpdateProperties=F)}d.push(b)}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode compacted update diffs",o)}const g=new Map((c||[]).map(o=>[String(o.id),o])),x=d.map(o=>{const f={id:o.id},p=g.get(String(o.id));return p&&p.geometry&&(f.newGeometry=p.geometry),o.removeAllProperties&&(f.removeAllProperties=!0),o.removeProperties&&(f.removeProperties=o.removeProperties),o.addOrUpdateProperties&&(f.addOrUpdateProperties=o.addOrUpdateProperties),f}).filter(o=>o!=null),y={};if(u?y.removeAll=!0:i.length&&(y.remove=i),l.length&&(y.add=l),x.length&&(y.update=x),this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(y);try{if(l&&l.length){for(const o of l)if(o&&o.id!=null)try{this._lastGeomHashes.set(String(o.id),J(o.geometry))}catch{this._lastGeomHashes.set(String(o.id),0)}}if(c&&c.length){for(const o of c)if(o&&o.id!=null)try{this._lastGeomHashes.set(String(o.id),J(o.geometry))}catch{this._lastGeomHashes.set(String(o.id),0)}}if(i&&i.length)for(const o of i)this._lastGeomHashes.delete(String(o))}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process binary geojson diff from worker",i)}else if(s.type==="geojson"&&s.payload)try{const i=s.payload instanceof Uint8Array?s.payload.buffer:s.payload,u=an.decode(i),l=JSON.parse(u);this.gjsource.setData(l)}catch(i){console.warn("Failed to decode worker response",i)}else try{this.gjsource.setData(s)}catch(i){console.warn("Failed to set worker data",i)}},this.map.addSource(this.source.id+"-proper",{type:"geojson",maxzoom:this.source.maxzoom,promoteId:this.fid,data:{}}),this.gjsource=this.map.getSource(this.source.id+"-proper"),maplibregl.addProtocol("proper",this._protocol),this.map.setTransformRequest((e,s)=>this.tiles.some(u=>e.startsWith(u))&&s==="Tile"?{url:"proper://"+e}:{url:e}),this._pendingPost=null,this._postTimer=null,this._postDelay=n.postDelay||100,this.map.on("sourcedata",e=>{if(e.sourceId===this.source.id&&e.isSourceLoaded){const s=this.map.querySourceFeatures(this.source.id,{sourceLayer:this.sourceLayer}),i=e.tile.tileID.canonical.z,u=this.tolerance*Math.pow(10,-.301*i+5.19),l={features:s.map(c=>({id:c.id,geometry:c.geometry,properties:c.properties})),tolerance:u};this._pendingPost=l,this._postTimer==null&&(this._postTimer=setTimeout(()=>{try{if(this._pendingPost){const c=this._pendingPost.features||[],d=new Map;let g=!0;if(this._lastGeomHashes&&this._lastGeomHashes.size===c.length)for(const x of c){const y=String(x.id==null?"":x.id);let o=0;try{o=J(x.geometry)}catch{o=0}if(d.set(y,o),this._lastGeomHashes.get(y)!==o){g=!1;break}}else g=!1;if(g){this._lastGeomHashes=d;return}try{const{meta:x,keys:y,propsBuffer:o,coordsArray:f}=ce(this._pendingPost.features||[],{pool:this._abPool,useSharedKeyTable:!0}),p=Object.fromEntries(d);this.minion.postMessage({type:"features_bin",meta:x,keys:y,propsBuf:o.buffer,tolerance:this._pendingPost.tolerance,coords:f.buffer,cacheSize:this.cacheSize,promoteId:this.fid,hashes:p},[o.buffer,f.buffer]),this._lastGeomHashes=d}catch{try{const y=Object.assign({},this._pendingPost,{promoteId:this.fid}),o=JSON.stringify(y),f=Ln.encode(o);this.minion.postMessage({type:"features",payload:f.buffer},[f.buffer])}catch{const o=Object.assign({},this._pendingPost,{promoteId:this.fid});this.minion.postMessage(o)}}}}finally{this._pendingPost=null,this._postTimer=null}},this._postDelay))}}),this.map.refreshTiles(this.source.id),this.gjsource}_protocol=async n=>{const s=n.url.replace("proper://",""),i=n.url.split(/\/|\./i);if(i===null||i.length<4)return console.warn(`Malformed URL: ${n.url}`),{data:null};const u=await fetch(s);let l;if(u.status===200){const c=i.length,[d,g,x]=i.slice(c-4,c-1).map(p=>p*1),y=await u.arrayBuffer(),o=new ee(new Nn(y)),f={layers:Object.entries(o.layers).reduce((p,[w,m])=>({...p,[w]:{...m,feature:b=>{const F=m.feature(b),_=F.loadGeometry().flat(1/0).some(L=>L.x>=m.extent-1||L.y>=m.extent-1||L.x<=1||L.y<=1);return F.properties.clipped=_,F}}}),{})};l=bn(f).buffer}else l=bn({}).buffer;return{data:l}}}maplibregl.VectorTileSource.prototype.ProperLabels=function(r){return this._proper||(this._proper=new kn({map:this._map,source:this})),this._proper};module.exports=kn;
