"use strict";const hn=23283064365386963e-26,Tn=12,fn=typeof TextDecoder>"u"?null:new TextDecoder("utf-8"),Q=0,J=1,K=2,W=5;class Nn{constructor(n=new Uint8Array(16)){this.buf=ArrayBuffer.isView(n)?n:new Uint8Array(n),this.dataView=new DataView(this.buf.buffer),this.pos=0,this.type=0,this.length=this.buf.length}readFields(n,e,s=this.length){for(;this.pos<s;){const i=this.readVarint(),u=i>>3,l=this.pos;this.type=i&7,n(u,e,this),this.pos===l&&this.skip(i)}return e}readMessage(n,e){return this.readFields(n,e,this.readVarint()+this.pos)}readFixed32(){const n=this.dataView.getUint32(this.pos,!0);return this.pos+=4,n}readSFixed32(){const n=this.dataView.getInt32(this.pos,!0);return this.pos+=4,n}readFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getUint32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readSFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getInt32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readFloat(){const n=this.dataView.getFloat32(this.pos,!0);return this.pos+=4,n}readDouble(){const n=this.dataView.getFloat64(this.pos,!0);return this.pos+=8,n}readVarint(n){const e=this.buf;let s,i;return i=e[this.pos++],s=i&127,i<128||(i=e[this.pos++],s|=(i&127)<<7,i<128)||(i=e[this.pos++],s|=(i&127)<<14,i<128)||(i=e[this.pos++],s|=(i&127)<<21,i<128)?s:(i=e[this.pos],s|=(i&15)<<28,Bn(s,n,this))}readVarint64(){return this.readVarint(!0)}readSVarint(){const n=this.readVarint();return n%2===1?(n+1)/-2:n/2}readBoolean(){return!!this.readVarint()}readString(){const n=this.readVarint()+this.pos,e=this.pos;return this.pos=n,n-e>=Tn&&fn?fn.decode(this.buf.subarray(e,n)):Kn(this.buf,e,n)}readBytes(){const n=this.readVarint()+this.pos,e=this.buf.subarray(this.pos,n);return this.pos=n,e}readPackedVarint(n=[],e){const s=this.readPackedEnd();for(;this.pos<s;)n.push(this.readVarint(e));return n}readPackedSVarint(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSVarint());return n}readPackedBoolean(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readBoolean());return n}readPackedFloat(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFloat());return n}readPackedDouble(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readDouble());return n}readPackedFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed32());return n}readPackedSFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed32());return n}readPackedFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed64());return n}readPackedSFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed64());return n}readPackedEnd(){return this.type===K?this.readVarint()+this.pos:this.pos+1}skip(n){const e=n&7;if(e===Q)for(;this.buf[this.pos++]>127;);else if(e===K)this.pos=this.readVarint()+this.pos;else if(e===W)this.pos+=4;else if(e===J)this.pos+=8;else throw new Error(`Unimplemented type: ${e}`)}writeTag(n,e){this.writeVarint(n<<3|e)}realloc(n){let e=this.length||16;for(;e<this.pos+n;)e*=2;if(e!==this.length){const s=new Uint8Array(e);s.set(this.buf),this.buf=s,this.dataView=new DataView(s.buffer),this.length=e}}finish(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)}writeFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeSFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*hn),!0),this.pos+=8}writeSFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*hn),!0),this.pos+=8}writeVarint(n){if(n=+n||0,n>268435455||n<0){On(n,this);return}this.realloc(4),this.buf[this.pos++]=n&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=n>>>7&127)))}writeSVarint(n){this.writeVarint(n<0?-n*2-1:n*2)}writeBoolean(n){this.writeVarint(+n)}writeString(n){n=String(n),this.realloc(n.length*4),this.pos++;const e=this.pos;this.pos=$n(this.buf,n,this.pos);const s=this.pos-e;s>=128&&cn(e,s,this),this.pos=e-1,this.writeVarint(s),this.pos+=s}writeFloat(n){this.realloc(4),this.dataView.setFloat32(this.pos,n,!0),this.pos+=4}writeDouble(n){this.realloc(8),this.dataView.setFloat64(this.pos,n,!0),this.pos+=8}writeBytes(n){const e=n.length;this.writeVarint(e),this.realloc(e);for(let s=0;s<e;s++)this.buf[this.pos++]=n[s]}writeRawMessage(n,e){this.pos++;const s=this.pos;n(e,this);const i=this.pos-s;i>=128&&cn(s,i,this),this.pos=s-1,this.writeVarint(i),this.pos+=i}writeMessage(n,e,s){this.writeTag(n,K),this.writeRawMessage(e,s)}writePackedVarint(n,e){e.length&&this.writeMessage(n,Vn,e)}writePackedSVarint(n,e){e.length&&this.writeMessage(n,In,e)}writePackedBoolean(n,e){e.length&&this.writeMessage(n,Un,e)}writePackedFloat(n,e){e.length&&this.writeMessage(n,Gn,e)}writePackedDouble(n,e){e.length&&this.writeMessage(n,Dn,e)}writePackedFixed32(n,e){e.length&&this.writeMessage(n,qn,e)}writePackedSFixed32(n,e){e.length&&this.writeMessage(n,Hn,e)}writePackedFixed64(n,e){e.length&&this.writeMessage(n,jn,e)}writePackedSFixed64(n,e){e.length&&this.writeMessage(n,zn,e)}writeBytesField(n,e){this.writeTag(n,K),this.writeBytes(e)}writeFixed32Field(n,e){this.writeTag(n,W),this.writeFixed32(e)}writeSFixed32Field(n,e){this.writeTag(n,W),this.writeSFixed32(e)}writeFixed64Field(n,e){this.writeTag(n,J),this.writeFixed64(e)}writeSFixed64Field(n,e){this.writeTag(n,J),this.writeSFixed64(e)}writeVarintField(n,e){this.writeTag(n,Q),this.writeVarint(e)}writeSVarintField(n,e){this.writeTag(n,Q),this.writeSVarint(e)}writeStringField(n,e){this.writeTag(n,K),this.writeString(e)}writeFloatField(n,e){this.writeTag(n,W),this.writeFloat(e)}writeDoubleField(n,e){this.writeTag(n,J),this.writeDouble(e)}writeBooleanField(n,e){this.writeVarintField(n,+e)}}function Bn(r,n,e){const s=e.buf;let i,u;if(u=s[e.pos++],i=(u&112)>>4,u<128||(u=s[e.pos++],i|=(u&127)<<3,u<128)||(u=s[e.pos++],i|=(u&127)<<10,u<128)||(u=s[e.pos++],i|=(u&127)<<17,u<128)||(u=s[e.pos++],i|=(u&127)<<24,u<128)||(u=s[e.pos++],i|=(u&1)<<31,u<128))return q(r,i,n);throw new Error("Expected varint not more than 10 bytes")}function q(r,n,e){return e?n*4294967296+(r>>>0):(n>>>0)*4294967296+(r>>>0)}function On(r,n){let e,s;if(r>=0?(e=r%4294967296|0,s=r/4294967296|0):(e=~(-r%4294967296),s=~(-r/4294967296),e^4294967295?e=e+1|0:(e=0,s=s+1|0)),r>=18446744073709552e3||r<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");n.realloc(10),Rn(e,s,n),Cn(s,n)}function Rn(r,n,e){e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos]=r&127}function Cn(r,n){const e=(r&7)<<4;n.buf[n.pos++]|=e|((r>>>=3)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127)))))}function cn(r,n,e){const s=n<=16383?1:n<=2097151?2:n<=268435455?3:Math.floor(Math.log(n)/(Math.LN2*7));e.realloc(s);for(let i=e.pos-1;i>=r;i--)e.buf[i+s]=e.buf[i]}function Vn(r,n){for(let e=0;e<r.length;e++)n.writeVarint(r[e])}function In(r,n){for(let e=0;e<r.length;e++)n.writeSVarint(r[e])}function Gn(r,n){for(let e=0;e<r.length;e++)n.writeFloat(r[e])}function Dn(r,n){for(let e=0;e<r.length;e++)n.writeDouble(r[e])}function Un(r,n){for(let e=0;e<r.length;e++)n.writeBoolean(r[e])}function qn(r,n){for(let e=0;e<r.length;e++)n.writeFixed32(r[e])}function Hn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed32(r[e])}function jn(r,n){for(let e=0;e<r.length;e++)n.writeFixed64(r[e])}function zn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed64(r[e])}function Kn(r,n,e){let s="",i=n;for(;i<e;){const u=r[i];let l=null,c=u>239?4:u>223?3:u>191?2:1;if(i+c>e)break;let p,y,g;c===1?u<128&&(l=u):c===2?(p=r[i+1],(p&192)===128&&(l=(u&31)<<6|p&63,l<=127&&(l=null))):c===3?(p=r[i+1],y=r[i+2],(p&192)===128&&(y&192)===128&&(l=(u&15)<<12|(p&63)<<6|y&63,(l<=2047||l>=55296&&l<=57343)&&(l=null))):c===4&&(p=r[i+1],y=r[i+2],g=r[i+3],(p&192)===128&&(y&192)===128&&(g&192)===128&&(l=(u&15)<<18|(p&63)<<12|(y&63)<<6|g&63,(l<=65535||l>=1114112)&&(l=null))),l===null?(l=65533,c=1):l>65535&&(l-=65536,s+=String.fromCharCode(l>>>10&1023|55296),l=56320|l&1023),s+=String.fromCharCode(l),i+=c}return s}function $n(r,n,e){for(let s=0,i,u;s<n.length;s++){if(i=n.charCodeAt(s),i>55295&&i<57344)if(u)if(i<56320){r[e++]=239,r[e++]=191,r[e++]=189,u=i;continue}else i=u-55296<<10|i-56320|65536,u=null;else{i>56319||s+1===n.length?(r[e++]=239,r[e++]=191,r[e++]=189):u=i;continue}else u&&(r[e++]=239,r[e++]=191,r[e++]=189,u=null);i<128?r[e++]=i:(i<2048?r[e++]=i>>6|192:(i<65536?r[e++]=i>>12|224:(r[e++]=i>>18|240,r[e++]=i>>12&63|128),r[e++]=i>>6&63|128),r[e++]=i&63|128)}return e}function I(r,n){this.x=r,this.y=n}I.prototype={clone(){return new I(this.x,this.y)},add(r){return this.clone()._add(r)},sub(r){return this.clone()._sub(r)},multByPoint(r){return this.clone()._multByPoint(r)},divByPoint(r){return this.clone()._divByPoint(r)},mult(r){return this.clone()._mult(r)},div(r){return this.clone()._div(r)},rotate(r){return this.clone()._rotate(r)},rotateAround(r,n){return this.clone()._rotateAround(r,n)},matMult(r){return this.clone()._matMult(r)},unit(){return this.clone()._unit()},perp(){return this.clone()._perp()},round(){return this.clone()._round()},mag(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals(r){return this.x===r.x&&this.y===r.y},dist(r){return Math.sqrt(this.distSqr(r))},distSqr(r){const n=r.x-this.x,e=r.y-this.y;return n*n+e*e},angle(){return Math.atan2(this.y,this.x)},angleTo(r){return Math.atan2(this.y-r.y,this.x-r.x)},angleWith(r){return this.angleWithSep(r.x,r.y)},angleWithSep(r,n){return Math.atan2(this.x*n-this.y*r,this.x*r+this.y*n)},_matMult(r){const n=r[0]*this.x+r[1]*this.y,e=r[2]*this.x+r[3]*this.y;return this.x=n,this.y=e,this},_add(r){return this.x+=r.x,this.y+=r.y,this},_sub(r){return this.x-=r.x,this.y-=r.y,this},_mult(r){return this.x*=r,this.y*=r,this},_div(r){return this.x/=r,this.y/=r,this},_multByPoint(r){return this.x*=r.x,this.y*=r.y,this},_divByPoint(r){return this.x/=r.x,this.y/=r.y,this},_unit(){return this._div(this.mag()),this},_perp(){const r=this.y;return this.y=this.x,this.x=-r,this},_rotate(r){const n=Math.cos(r),e=Math.sin(r),s=n*this.x-e*this.y,i=e*this.x+n*this.y;return this.x=s,this.y=i,this},_rotateAround(r,n){const e=Math.cos(r),s=Math.sin(r),i=n.x+e*(this.x-n.x)-s*(this.y-n.y),u=n.y+s*(this.x-n.x)+e*(this.y-n.y);return this.x=i,this.y=u,this},_round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},constructor:I};I.convert=function(r){if(r instanceof I)return r;if(Array.isArray(r))return new I(+r[0],+r[1]);if(r.x!==void 0&&r.y!==void 0)return new I(+r.x,+r.y);throw new Error("Expected [x, y] or {x, y} point format")};class _n{constructor(n,e,s,i,u){this.properties={},this.extent=s,this.type=0,this.id=void 0,this._pbf=n,this._geometry=-1,this._keys=i,this._values=u,n.readFields(Jn,this,e)}loadGeometry(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos,s=[];let i,u=1,l=0,c=0,p=0;for(;n.pos<e;){if(l<=0){const y=n.readVarint();u=y&7,l=y>>3}if(l--,u===1||u===2)c+=n.readSVarint(),p+=n.readSVarint(),u===1&&(i&&s.push(i),i=[]),i&&i.push(new I(c,p));else if(u===7)i&&i.push(i[0].clone());else throw new Error(`unknown command ${u}`)}return i&&s.push(i),s}bbox(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos;let s=1,i=0,u=0,l=0,c=1/0,p=-1/0,y=1/0,g=-1/0;for(;n.pos<e;){if(i<=0){const x=n.readVarint();s=x&7,i=x>>3}if(i--,s===1||s===2)u+=n.readSVarint(),l+=n.readSVarint(),u<c&&(c=u),u>p&&(p=u),l<y&&(y=l),l>g&&(g=l);else if(s!==7)throw new Error(`unknown command ${s}`)}return[c,y,p,g]}toGeoJSON(n,e,s){const i=this.extent*Math.pow(2,s),u=this.extent*n,l=this.extent*e,c=this.loadGeometry();function p(o){return[(o.x+u)*360/i-180,360/Math.PI*Math.atan(Math.exp((1-(o.y+l)*2/i)*Math.PI))-90]}function y(o){return o.map(p)}let g;if(this.type===1){const o=[];for(const d of c)o.push(d[0]);const f=y(o);g=o.length===1?{type:"Point",coordinates:f[0]}:{type:"MultiPoint",coordinates:f}}else if(this.type===2){const o=c.map(y);g=o.length===1?{type:"LineString",coordinates:o[0]}:{type:"MultiLineString",coordinates:o}}else if(this.type===3){const o=Xn(c),f=[];for(const d of o)f.push(d.map(y));g=f.length===1?{type:"Polygon",coordinates:f[0]}:{type:"MultiPolygon",coordinates:f}}else throw new Error("unknown feature type");const x={type:"Feature",geometry:g,properties:this.properties};return this.id!=null&&(x.id=this.id),x}}_n.types=["Unknown","Point","LineString","Polygon"];function Jn(r,n,e){r===1?n.id=e.readVarint():r===2?Wn(e,n):r===3?n.type=e.readVarint():r===4&&(n._geometry=e.pos)}function Wn(r,n){const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=n._keys[r.readVarint()],i=n._values[r.readVarint()];n.properties[s]=i}}function Xn(r){const n=r.length;if(n<=1)return[r];const e=[];let s,i;for(let u=0;u<n;u++){const l=Yn(r[u]);l!==0&&(i===void 0&&(i=l<0),i===l<0?(s&&e.push(s),s=[r[u]]):s&&s.push(r[u]))}return s&&e.push(s),e}function Yn(r){let n=0;for(let e=0,s=r.length,i=s-1,u,l;e<s;i=e++)u=r[e],l=r[i],n+=(l.x-u.x)*(u.y+l.y);return n}class Zn{constructor(n,e){this.version=1,this.name="",this.extent=4096,this.length=0,this._pbf=n,this._keys=[],this._values=[],this._features=[],n.readFields(Qn,this,e),this.length=this._features.length}feature(n){if(n<0||n>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[n];const e=this._pbf.readVarint()+this._pbf.pos;return new _n(this._pbf,e,this.extent,this._keys,this._values)}}function Qn(r,n,e){r===15?n.version=e.readVarint():r===1?n.name=e.readString():r===5?n.extent=e.readVarint():r===2?n._features.push(e.pos):r===3?n._keys.push(e.readString()):r===4&&n._values.push(ne(e))}function ne(r){let n=null;const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=r.readVarint()>>3;n=s===1?r.readString():s===2?r.readFloat():s===3?r.readDouble():s===4?r.readVarint64():s===5?r.readVarint():s===6?r.readSVarint():s===7?r.readBoolean():null}if(n==null)throw new Error("unknown feature value");return n}class ee{constructor(n,e){this.layers=n.readFields(te,{},e)}}function te(r,n,e){if(r===3){const s=new Zn(e,e.readVarint()+e.pos);s.length&&(n[s.name]=s)}}function re(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var H={exports:{}},X={};var pn;function ie(){return pn||(pn=1,X.read=function(r,n,e,s,i){var u,l,c=i*8-s-1,p=(1<<c)-1,y=p>>1,g=-7,x=e?i-1:0,o=e?-1:1,f=r[n+x];for(x+=o,u=f&(1<<-g)-1,f>>=-g,g+=c;g>0;u=u*256+r[n+x],x+=o,g-=8);for(l=u&(1<<-g)-1,u>>=-g,g+=s;g>0;l=l*256+r[n+x],x+=o,g-=8);if(u===0)u=1-y;else{if(u===p)return l?NaN:(f?-1:1)*(1/0);l=l+Math.pow(2,s),u=u-y}return(f?-1:1)*l*Math.pow(2,u-s)},X.write=function(r,n,e,s,i,u){var l,c,p,y=u*8-i-1,g=(1<<y)-1,x=g>>1,o=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,f=s?0:u-1,d=s?1:-1,v=n<0||n===0&&1/n<0?1:0;for(n=Math.abs(n),isNaN(n)||n===1/0?(c=isNaN(n)?1:0,l=g):(l=Math.floor(Math.log(n)/Math.LN2),n*(p=Math.pow(2,-l))<1&&(l--,p*=2),l+x>=1?n+=o/p:n+=o*Math.pow(2,1-x),n*p>=2&&(l++,p/=2),l+x>=g?(c=0,l=g):l+x>=1?(c=(n*p-1)*Math.pow(2,i),l=l+x):(c=n*Math.pow(2,x-1)*Math.pow(2,i),l=0));i>=8;r[e+f]=c&255,f+=d,c/=256,i-=8);for(l=l<<i|c,y+=i;y>0;r[e+f]=l&255,f+=d,l/=256,y-=8);r[e+f-d]|=v*128}),X}var nn,dn;function se(){if(dn)return nn;dn=1,nn=n;var r=ie();function n(t){this.buf=ArrayBuffer.isView&&ArrayBuffer.isView(t)?t:new Uint8Array(t||0),this.pos=0,this.type=0,this.length=this.buf.length}n.Varint=0,n.Fixed64=1,n.Bytes=2,n.Fixed32=5;var e=65536*65536,s=1/e,i=12,u=typeof TextDecoder>"u"?null:new TextDecoder("utf-8");n.prototype={destroy:function(){this.buf=null},readFields:function(t,a,h){for(h=h||this.length;this.pos<h;){var P=this.readVarint(),b=P>>3,E=this.pos;this.type=P&7,t(b,a,this),this.pos===E&&this.skip(P)}return a},readMessage:function(t,a){return this.readFields(t,a,this.readVarint()+this.pos)},readFixed32:function(){var t=T(this.buf,this.pos);return this.pos+=4,t},readSFixed32:function(){var t=A(this.buf,this.pos);return this.pos+=4,t},readFixed64:function(){var t=T(this.buf,this.pos)+T(this.buf,this.pos+4)*e;return this.pos+=8,t},readSFixed64:function(){var t=T(this.buf,this.pos)+A(this.buf,this.pos+4)*e;return this.pos+=8,t},readFloat:function(){var t=r.read(this.buf,this.pos,!0,23,4);return this.pos+=4,t},readDouble:function(){var t=r.read(this.buf,this.pos,!0,52,8);return this.pos+=8,t},readVarint:function(t){var a=this.buf,h,P;return P=a[this.pos++],h=P&127,P<128||(P=a[this.pos++],h|=(P&127)<<7,P<128)||(P=a[this.pos++],h|=(P&127)<<14,P<128)||(P=a[this.pos++],h|=(P&127)<<21,P<128)?h:(P=a[this.pos],h|=(P&15)<<28,l(h,t,this))},readVarint64:function(){return this.readVarint(!0)},readSVarint:function(){var t=this.readVarint();return t%2===1?(t+1)/-2:t/2},readBoolean:function(){return!!this.readVarint()},readString:function(){var t=this.readVarint()+this.pos,a=this.pos;return this.pos=t,t-a>=i&&u?B(this.buf,a,t):k(this.buf,a,t)},readBytes:function(){var t=this.readVarint()+this.pos,a=this.buf.subarray(this.pos,t);return this.pos=t,a},readPackedVarint:function(t,a){if(this.type!==n.Bytes)return t.push(this.readVarint(a));var h=c(this);for(t=t||[];this.pos<h;)t.push(this.readVarint(a));return t},readPackedSVarint:function(t){if(this.type!==n.Bytes)return t.push(this.readSVarint());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSVarint());return t},readPackedBoolean:function(t){if(this.type!==n.Bytes)return t.push(this.readBoolean());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readBoolean());return t},readPackedFloat:function(t){if(this.type!==n.Bytes)return t.push(this.readFloat());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFloat());return t},readPackedDouble:function(t){if(this.type!==n.Bytes)return t.push(this.readDouble());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readDouble());return t},readPackedFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed32());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFixed32());return t},readPackedSFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed32());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSFixed32());return t},readPackedFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed64());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFixed64());return t},readPackedSFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed64());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSFixed64());return t},skip:function(t){var a=t&7;if(a===n.Varint)for(;this.buf[this.pos++]>127;);else if(a===n.Bytes)this.pos=this.readVarint()+this.pos;else if(a===n.Fixed32)this.pos+=4;else if(a===n.Fixed64)this.pos+=8;else throw new Error("Unimplemented type: "+a)},writeTag:function(t,a){this.writeVarint(t<<3|a)},realloc:function(t){for(var a=this.length||16;a<this.pos+t;)a*=2;if(a!==this.length){var h=new Uint8Array(a);h.set(this.buf),this.buf=h,this.length=a}},finish:function(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)},writeFixed32:function(t){this.realloc(4),M(this.buf,t,this.pos),this.pos+=4},writeSFixed32:function(t){this.realloc(4),M(this.buf,t,this.pos),this.pos+=4},writeFixed64:function(t){this.realloc(8),M(this.buf,t&-1,this.pos),M(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeSFixed64:function(t){this.realloc(8),M(this.buf,t&-1,this.pos),M(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeVarint:function(t){if(t=+t||0,t>268435455||t<0){y(t,this);return}this.realloc(4),this.buf[this.pos++]=t&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=t>>>7&127)))},writeSVarint:function(t){this.writeVarint(t<0?-t*2-1:t*2)},writeBoolean:function(t){this.writeVarint(!!t)},writeString:function(t){t=String(t),this.realloc(t.length*4),this.pos++;var a=this.pos;this.pos=O(this.buf,t,this.pos);var h=this.pos-a;h>=128&&o(a,h,this),this.pos=a-1,this.writeVarint(h),this.pos+=h},writeFloat:function(t){this.realloc(4),r.write(this.buf,t,this.pos,!0,23,4),this.pos+=4},writeDouble:function(t){this.realloc(8),r.write(this.buf,t,this.pos,!0,52,8),this.pos+=8},writeBytes:function(t){var a=t.length;this.writeVarint(a),this.realloc(a);for(var h=0;h<a;h++)this.buf[this.pos++]=t[h]},writeRawMessage:function(t,a){this.pos++;var h=this.pos;t(a,this);var P=this.pos-h;P>=128&&o(h,P,this),this.pos=h-1,this.writeVarint(P),this.pos+=P},writeMessage:function(t,a,h){this.writeTag(t,n.Bytes),this.writeRawMessage(a,h)},writePackedVarint:function(t,a){a.length&&this.writeMessage(t,f,a)},writePackedSVarint:function(t,a){a.length&&this.writeMessage(t,d,a)},writePackedBoolean:function(t,a){a.length&&this.writeMessage(t,S,a)},writePackedFloat:function(t,a){a.length&&this.writeMessage(t,v,a)},writePackedDouble:function(t,a){a.length&&this.writeMessage(t,m,a)},writePackedFixed32:function(t,a){a.length&&this.writeMessage(t,F,a)},writePackedSFixed32:function(t,a){a.length&&this.writeMessage(t,_,a)},writePackedFixed64:function(t,a){a.length&&this.writeMessage(t,w,a)},writePackedSFixed64:function(t,a){a.length&&this.writeMessage(t,L,a)},writeBytesField:function(t,a){this.writeTag(t,n.Bytes),this.writeBytes(a)},writeFixed32Field:function(t,a){this.writeTag(t,n.Fixed32),this.writeFixed32(a)},writeSFixed32Field:function(t,a){this.writeTag(t,n.Fixed32),this.writeSFixed32(a)},writeFixed64Field:function(t,a){this.writeTag(t,n.Fixed64),this.writeFixed64(a)},writeSFixed64Field:function(t,a){this.writeTag(t,n.Fixed64),this.writeSFixed64(a)},writeVarintField:function(t,a){this.writeTag(t,n.Varint),this.writeVarint(a)},writeSVarintField:function(t,a){this.writeTag(t,n.Varint),this.writeSVarint(a)},writeStringField:function(t,a){this.writeTag(t,n.Bytes),this.writeString(a)},writeFloatField:function(t,a){this.writeTag(t,n.Fixed32),this.writeFloat(a)},writeDoubleField:function(t,a){this.writeTag(t,n.Fixed64),this.writeDouble(a)},writeBooleanField:function(t,a){this.writeVarintField(t,!!a)}};function l(t,a,h){var P=h.buf,b,E;if(E=P[h.pos++],b=(E&112)>>4,E<128||(E=P[h.pos++],b|=(E&127)<<3,E<128)||(E=P[h.pos++],b|=(E&127)<<10,E<128)||(E=P[h.pos++],b|=(E&127)<<17,E<128)||(E=P[h.pos++],b|=(E&127)<<24,E<128)||(E=P[h.pos++],b|=(E&1)<<31,E<128))return p(t,b,a);throw new Error("Expected varint not more than 10 bytes")}function c(t){return t.type===n.Bytes?t.readVarint()+t.pos:t.pos+1}function p(t,a,h){return h?a*4294967296+(t>>>0):(a>>>0)*4294967296+(t>>>0)}function y(t,a){var h,P;if(t>=0?(h=t%4294967296|0,P=t/4294967296|0):(h=~(-t%4294967296),P=~(-t/4294967296),h^4294967295?h=h+1|0:(h=0,P=P+1|0)),t>=18446744073709552e3||t<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");a.realloc(10),g(h,P,a),x(P,a)}function g(t,a,h){h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos]=t&127}function x(t,a){var h=(t&7)<<4;a.buf[a.pos++]|=h|((t>>>=3)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127)))))}function o(t,a,h){var P=a<=16383?1:a<=2097151?2:a<=268435455?3:Math.floor(Math.log(a)/(Math.LN2*7));h.realloc(P);for(var b=h.pos-1;b>=t;b--)h.buf[b+P]=h.buf[b]}function f(t,a){for(var h=0;h<t.length;h++)a.writeVarint(t[h])}function d(t,a){for(var h=0;h<t.length;h++)a.writeSVarint(t[h])}function v(t,a){for(var h=0;h<t.length;h++)a.writeFloat(t[h])}function m(t,a){for(var h=0;h<t.length;h++)a.writeDouble(t[h])}function S(t,a){for(var h=0;h<t.length;h++)a.writeBoolean(t[h])}function F(t,a){for(var h=0;h<t.length;h++)a.writeFixed32(t[h])}function _(t,a){for(var h=0;h<t.length;h++)a.writeSFixed32(t[h])}function w(t,a){for(var h=0;h<t.length;h++)a.writeFixed64(t[h])}function L(t,a){for(var h=0;h<t.length;h++)a.writeSFixed64(t[h])}function T(t,a){return(t[a]|t[a+1]<<8|t[a+2]<<16)+t[a+3]*16777216}function M(t,a,h){t[h]=a,t[h+1]=a>>>8,t[h+2]=a>>>16,t[h+3]=a>>>24}function A(t,a){return(t[a]|t[a+1]<<8|t[a+2]<<16)+(t[a+3]<<24)}function k(t,a,h){for(var P="",b=a;b<h;){var E=t[b],N=null,G=E>239?4:E>223?3:E>191?2:1;if(b+G>h)break;var V,U,Z;G===1?E<128&&(N=E):G===2?(V=t[b+1],(V&192)===128&&(N=(E&31)<<6|V&63,N<=127&&(N=null))):G===3?(V=t[b+1],U=t[b+2],(V&192)===128&&(U&192)===128&&(N=(E&15)<<12|(V&63)<<6|U&63,(N<=2047||N>=55296&&N<=57343)&&(N=null))):G===4&&(V=t[b+1],U=t[b+2],Z=t[b+3],(V&192)===128&&(U&192)===128&&(Z&192)===128&&(N=(E&15)<<18|(V&63)<<12|(U&63)<<6|Z&63,(N<=65535||N>=1114112)&&(N=null))),N===null?(N=65533,G=1):N>65535&&(N-=65536,P+=String.fromCharCode(N>>>10&1023|55296),N=56320|N&1023),P+=String.fromCharCode(N),b+=G}return P}function B(t,a,h){return u.decode(t.subarray(a,h))}function O(t,a,h){for(var P=0,b,E;P<a.length;P++){if(b=a.charCodeAt(P),b>55295&&b<57344)if(E)if(b<56320){t[h++]=239,t[h++]=191,t[h++]=189,E=b;continue}else b=E-55296<<10|b-56320|65536,E=null;else{b>56319||P+1===a.length?(t[h++]=239,t[h++]=191,t[h++]=189):E=b;continue}else E&&(t[h++]=239,t[h++]=191,t[h++]=189,E=null);b<128?t[h++]=b:(b<2048?t[h++]=b>>6|192:(b<65536?t[h++]=b>>12|224:(t[h++]=b>>18|240,t[h++]=b>>12&63|128),t[h++]=b>>6&63|128),t[h++]=b&63|128)}return h}return nn}var en,gn;function En(){if(gn)return en;gn=1,en=r;function r(n,e){this.x=n,this.y=e}return r.prototype={clone:function(){return new r(this.x,this.y)},add:function(n){return this.clone()._add(n)},sub:function(n){return this.clone()._sub(n)},multByPoint:function(n){return this.clone()._multByPoint(n)},divByPoint:function(n){return this.clone()._divByPoint(n)},mult:function(n){return this.clone()._mult(n)},div:function(n){return this.clone()._div(n)},rotate:function(n){return this.clone()._rotate(n)},rotateAround:function(n,e){return this.clone()._rotateAround(n,e)},matMult:function(n){return this.clone()._matMult(n)},unit:function(){return this.clone()._unit()},perp:function(){return this.clone()._perp()},round:function(){return this.clone()._round()},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals:function(n){return this.x===n.x&&this.y===n.y},dist:function(n){return Math.sqrt(this.distSqr(n))},distSqr:function(n){var e=n.x-this.x,s=n.y-this.y;return e*e+s*s},angle:function(){return Math.atan2(this.y,this.x)},angleTo:function(n){return Math.atan2(this.y-n.y,this.x-n.x)},angleWith:function(n){return this.angleWithSep(n.x,n.y)},angleWithSep:function(n,e){return Math.atan2(this.x*e-this.y*n,this.x*n+this.y*e)},_matMult:function(n){var e=n[0]*this.x+n[1]*this.y,s=n[2]*this.x+n[3]*this.y;return this.x=e,this.y=s,this},_add:function(n){return this.x+=n.x,this.y+=n.y,this},_sub:function(n){return this.x-=n.x,this.y-=n.y,this},_mult:function(n){return this.x*=n,this.y*=n,this},_div:function(n){return this.x/=n,this.y/=n,this},_multByPoint:function(n){return this.x*=n.x,this.y*=n.y,this},_divByPoint:function(n){return this.x/=n.x,this.y/=n.y,this},_unit:function(){return this._div(this.mag()),this},_perp:function(){var n=this.y;return this.y=this.x,this.x=-n,this},_rotate:function(n){var e=Math.cos(n),s=Math.sin(n),i=e*this.x-s*this.y,u=s*this.x+e*this.y;return this.x=i,this.y=u,this},_rotateAround:function(n,e){var s=Math.cos(n),i=Math.sin(n),u=e.x+s*(this.x-e.x)-i*(this.y-e.y),l=e.y+i*(this.x-e.x)+s*(this.y-e.y);return this.x=u,this.y=l,this},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},r.convert=function(n){return n instanceof r?n:Array.isArray(n)?new r(n[0],n[1]):n},en}var $={},tn,yn;function Mn(){if(yn)return tn;yn=1;var r=En();tn=n;function n(l,c,p,y,g){this.properties={},this.extent=p,this.type=0,this._pbf=l,this._geometry=-1,this._keys=y,this._values=g,l.readFields(e,this,c)}function e(l,c,p){l==1?c.id=p.readVarint():l==2?s(p,c):l==3?c.type=p.readVarint():l==4&&(c._geometry=p.pos)}function s(l,c){for(var p=l.readVarint()+l.pos;l.pos<p;){var y=c._keys[l.readVarint()],g=c._values[l.readVarint()];c.properties[y]=g}}n.types=["Unknown","Point","LineString","Polygon"],n.prototype.loadGeometry=function(){var l=this._pbf;l.pos=this._geometry;for(var c=l.readVarint()+l.pos,p=1,y=0,g=0,x=0,o=[],f;l.pos<c;){if(y<=0){var d=l.readVarint();p=d&7,y=d>>3}if(y--,p===1||p===2)g+=l.readSVarint(),x+=l.readSVarint(),p===1&&(f&&o.push(f),f=[]),f.push(new r(g,x));else if(p===7)f&&f.push(f[0].clone());else throw new Error("unknown command "+p)}return f&&o.push(f),o},n.prototype.bbox=function(){var l=this._pbf;l.pos=this._geometry;for(var c=l.readVarint()+l.pos,p=1,y=0,g=0,x=0,o=1/0,f=-1/0,d=1/0,v=-1/0;l.pos<c;){if(y<=0){var m=l.readVarint();p=m&7,y=m>>3}if(y--,p===1||p===2)g+=l.readSVarint(),x+=l.readSVarint(),g<o&&(o=g),g>f&&(f=g),x<d&&(d=x),x>v&&(v=x);else if(p!==7)throw new Error("unknown command "+p)}return[o,d,f,v]},n.prototype.toGeoJSON=function(l,c,p){var y=this.extent*Math.pow(2,p),g=this.extent*l,x=this.extent*c,o=this.loadGeometry(),f=n.types[this.type],d,v;function m(_){for(var w=0;w<_.length;w++){var L=_[w],T=180-(L.y+x)*360/y;_[w]=[(L.x+g)*360/y-180,360/Math.PI*Math.atan(Math.exp(T*Math.PI/180))-90]}}switch(this.type){case 1:var S=[];for(d=0;d<o.length;d++)S[d]=o[d][0];o=S,m(o);break;case 2:for(d=0;d<o.length;d++)m(o[d]);break;case 3:for(o=i(o),d=0;d<o.length;d++)for(v=0;v<o[d].length;v++)m(o[d][v]);break}o.length===1?o=o[0]:f="Multi"+f;var F={type:"Feature",geometry:{type:f,coordinates:o},properties:this.properties};return"id"in this&&(F.id=this.id),F};function i(l){var c=l.length;if(c<=1)return[l];for(var p=[],y,g,x=0;x<c;x++){var o=u(l[x]);o!==0&&(g===void 0&&(g=o<0),g===o<0?(y&&p.push(y),y=[l[x]]):y.push(l[x]))}return y&&p.push(y),p}function u(l){for(var c=0,p=0,y=l.length,g=y-1,x,o;p<y;g=p++)x=l[p],o=l[g],c+=(o.x-x.x)*(x.y+o.y);return c}return tn}var rn,xn;function An(){if(xn)return rn;xn=1;var r=Mn();rn=n;function n(i,u){this.version=1,this.name=null,this.extent=4096,this.length=0,this._pbf=i,this._keys=[],this._values=[],this._features=[],i.readFields(e,this,u),this.length=this._features.length}function e(i,u,l){i===15?u.version=l.readVarint():i===1?u.name=l.readString():i===5?u.extent=l.readVarint():i===2?u._features.push(l.pos):i===3?u._keys.push(l.readString()):i===4&&u._values.push(s(l))}function s(i){for(var u=null,l=i.readVarint()+i.pos;i.pos<l;){var c=i.readVarint()>>3;u=c===1?i.readString():c===2?i.readFloat():c===3?i.readDouble():c===4?i.readVarint64():c===5?i.readVarint():c===6?i.readSVarint():c===7?i.readBoolean():null}return u}return n.prototype.feature=function(i){if(i<0||i>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[i];var u=this._pbf.readVarint()+this._pbf.pos;return new r(this._pbf,u,this.extent,this._keys,this._values)},rn}var sn,mn;function oe(){if(mn)return sn;mn=1;var r=An();sn=n;function n(s,i){this.layers=s.readFields(e,{},i)}function e(s,i,u){if(s===3){var l=new r(u,u.readVarint()+u.pos);l.length&&(i[l.name]=l)}}return sn}var wn;function ae(){return wn||(wn=1,$.VectorTile=oe(),$.VectorTileFeature=Mn(),$.VectorTileLayer=An()),$}var on,bn;function le(){if(bn)return on;bn=1;var r=En(),n=ae().VectorTileFeature;on=e;function e(i,u){this.options=u||{},this.features=i,this.length=i.length}e.prototype.feature=function(i){return new s(this.features[i],this.options.extent)};function s(i,u){this.id=typeof i.id=="number"?i.id:void 0,this.type=i.type,this.rawGeometry=i.type===1?[i.geometry]:i.geometry,this.properties=i.tags,this.extent=u||4096}return s.prototype.loadGeometry=function(){var i=this.rawGeometry;this.geometry=[];for(var u=0;u<i.length;u++){for(var l=i[u],c=[],p=0;p<l.length;p++)c.push(new r(l[p][0],l[p][1]));this.geometry.push(c)}return this.geometry},s.prototype.bbox=function(){this.geometry||this.loadGeometry();for(var i=this.geometry,u=1/0,l=-1/0,c=1/0,p=-1/0,y=0;y<i.length;y++)for(var g=i[y],x=0;x<g.length;x++){var o=g[x];u=Math.min(u,o.x),l=Math.max(l,o.x),c=Math.min(c,o.y),p=Math.max(p,o.y)}return[u,c,l,p]},s.prototype.toGeoJSON=n.prototype.toGeoJSON,on}var vn;function ue(){if(vn)return H.exports;vn=1;var r=se(),n=le();H.exports=e,H.exports.fromVectorTileJs=e,H.exports.fromGeojsonVt=s,H.exports.GeoJSONWrapper=n;function e(o){var f=new r;return i(o,f),f.finish()}function s(o,f){f=f||{};var d={};for(var v in o)d[v]=new n(o[v].features,f),d[v].name=v,d[v].version=f.version,d[v].extent=f.extent;return e({layers:d})}function i(o,f){for(var d in o.layers)f.writeMessage(3,u,o.layers[d])}function u(o,f){f.writeVarintField(15,o.version||1),f.writeStringField(1,o.name||""),f.writeVarintField(5,o.extent||4096);var d,v={keys:[],values:[],keycache:{},valuecache:{}};for(d=0;d<o.length;d++)v.feature=o.feature(d),f.writeMessage(2,l,v);var m=v.keys;for(d=0;d<m.length;d++)f.writeStringField(3,m[d]);var S=v.values;for(d=0;d<S.length;d++)f.writeMessage(4,x,S[d])}function l(o,f){var d=o.feature;d.id!==void 0&&f.writeVarintField(1,d.id),f.writeMessage(2,c,o),f.writeVarintField(3,d.type),f.writeMessage(4,g,d)}function c(o,f){var d=o.feature,v=o.keys,m=o.values,S=o.keycache,F=o.valuecache;for(var _ in d.properties){var w=d.properties[_],L=S[_];if(w!==null){typeof L>"u"&&(v.push(_),L=v.length-1,S[_]=L),f.writeVarint(L);var T=typeof w;T!=="string"&&T!=="boolean"&&T!=="number"&&(w=JSON.stringify(w));var M=T+":"+w,A=F[M];typeof A>"u"&&(m.push(w),A=m.length-1,F[M]=A),f.writeVarint(A)}}}function p(o,f){return(f<<3)+(o&7)}function y(o){return o<<1^o>>31}function g(o,f){for(var d=o.loadGeometry(),v=o.type,m=0,S=0,F=d.length,_=0;_<F;_++){var w=d[_],L=1;v===1&&(L=w.length),f.writeVarint(p(1,L));for(var T=v===3?w.length-1:w.length,M=0;M<T;M++){M===1&&v!==1&&f.writeVarint(p(2,T-1));var A=w[M].x-m,k=w[M].y-S;f.writeVarint(y(A)),f.writeVarint(y(k)),m+=A,S+=k}v===3&&f.writeVarint(p(7,1))}}function x(o,f){var d=typeof o;d==="string"?f.writeStringField(1,o):d==="boolean"?f.writeBooleanField(7,o):d==="number"&&(o%1!==0?f.writeDoubleField(3,o):o<0?f.writeSVarintField(6,o):f.writeVarintField(5,o))}return H.exports}var he=ue();const Sn=re(he),Ln=`var Yt = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, We = Math.ceil, re = Math.floor, Q = "[BigNumber Error] ", pt = Q + "Number primitive has more than 15 significant digits: ", se = 1e14, G = 14, Qe = 9007199254740991, je = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], ye = 1e7, X = 1e9;
function Bt(t) {
  var e, r, n, i = m.prototype = { constructor: m, toString: null, valueOf: null }, o = new m(1), u = 20, a = 4, h = -7, c = 21, M = -1e7, d = 1e7, S = !1, O = 1, P = 0, L = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, _ = "0123456789abcdefghijklmnopqrstuvwxyz", A = !0;
  function m(s, l) {
    var f, w, p, y, v, g, x, E, b = this;
    if (!(b instanceof m)) return new m(s, l);
    if (l == null) {
      if (s && s._isBigNumber === !0) {
        b.s = s.s, !s.c || s.e > d ? b.c = b.e = null : s.e < M ? b.c = [b.e = 0] : (b.e = s.e, b.c = s.c.slice());
        return;
      }
      if ((g = typeof s == "number") && s * 0 == 0) {
        if (b.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (y = 0, v = s; v >= 10; v /= 10, y++) ;
          y > d ? b.c = b.e = null : (b.e = y, b.c = [s]);
          return;
        }
        E = String(s);
      } else {
        if (!Yt.test(E = String(s))) return n(b, E, g);
        b.s = E.charCodeAt(0) == 45 ? (E = E.slice(1), -1) : 1;
      }
      (y = E.indexOf(".")) > -1 && (E = E.replace(".", "")), (v = E.search(/e/i)) > 0 ? (y < 0 && (y = v), y += +E.slice(v + 1), E = E.substring(0, v)) : y < 0 && (y = E.length);
    } else {
      if (z(l, 2, _.length, "Base"), l == 10 && A)
        return b = new m(s), C(b, u + b.e + 1, a);
      if (E = String(s), g = typeof s == "number") {
        if (s * 0 != 0) return n(b, E, g, l);
        if (b.s = 1 / s < 0 ? (E = E.slice(1), -1) : 1, m.DEBUG && E.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(pt + s);
      } else
        b.s = E.charCodeAt(0) === 45 ? (E = E.slice(1), -1) : 1;
      for (f = _.slice(0, l), y = v = 0, x = E.length; v < x; v++)
        if (f.indexOf(w = E.charAt(v)) < 0) {
          if (w == ".") {
            if (v > y) {
              y = x;
              continue;
            }
          } else if (!p && (E == E.toUpperCase() && (E = E.toLowerCase()) || E == E.toLowerCase() && (E = E.toUpperCase()))) {
            p = !0, v = -1, y = 0;
            continue;
          }
          return n(b, String(s), g, l);
        }
      g = !1, E = r(E, l, 10, b.s), (y = E.indexOf(".")) > -1 ? E = E.replace(".", "") : y = E.length;
    }
    for (v = 0; E.charCodeAt(v) === 48; v++) ;
    for (x = E.length; E.charCodeAt(--x) === 48; ) ;
    if (E = E.slice(v, ++x)) {
      if (x -= v, g && m.DEBUG && x > 15 && (s > Qe || s !== re(s)))
        throw Error(pt + b.s * s);
      if ((y = y - v - 1) > d)
        b.c = b.e = null;
      else if (y < M)
        b.c = [b.e = 0];
      else {
        if (b.e = y, b.c = [], v = (y + 1) % G, y < 0 && (v += G), v < x) {
          for (v && b.c.push(+E.slice(0, v)), x -= G; v < x; )
            b.c.push(+E.slice(v, v += G));
          v = G - (E = E.slice(v)).length;
        } else
          v -= x;
        for (; v--; E += "0") ;
        b.c.push(+E);
      }
    } else
      b.c = [b.e = 0];
  }
  m.clone = Bt, m.ROUND_UP = 0, m.ROUND_DOWN = 1, m.ROUND_CEIL = 2, m.ROUND_FLOOR = 3, m.ROUND_HALF_UP = 4, m.ROUND_HALF_DOWN = 5, m.ROUND_HALF_EVEN = 6, m.ROUND_HALF_CEIL = 7, m.ROUND_HALF_FLOOR = 8, m.EUCLID = 9, m.config = m.set = function(s) {
    var l, f;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(l = "DECIMAL_PLACES") && (f = s[l], z(f, 0, X, l), u = f), s.hasOwnProperty(l = "ROUNDING_MODE") && (f = s[l], z(f, 0, 8, l), a = f), s.hasOwnProperty(l = "EXPONENTIAL_AT") && (f = s[l], f && f.pop ? (z(f[0], -X, 0, l), z(f[1], 0, X, l), h = f[0], c = f[1]) : (z(f, -X, X, l), h = -(c = f < 0 ? -f : f))), s.hasOwnProperty(l = "RANGE"))
          if (f = s[l], f && f.pop)
            z(f[0], -X, -1, l), z(f[1], 1, X, l), M = f[0], d = f[1];
          else if (z(f, -X, X, l), f)
            M = -(d = f < 0 ? -f : f);
          else
            throw Error(Q + l + " cannot be zero: " + f);
        if (s.hasOwnProperty(l = "CRYPTO"))
          if (f = s[l], f === !!f)
            if (f)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                S = f;
              else
                throw S = !f, Error(Q + "crypto unavailable");
            else
              S = f;
          else
            throw Error(Q + l + " not true or false: " + f);
        if (s.hasOwnProperty(l = "MODULO_MODE") && (f = s[l], z(f, 0, 9, l), O = f), s.hasOwnProperty(l = "POW_PRECISION") && (f = s[l], z(f, 0, X, l), P = f), s.hasOwnProperty(l = "FORMAT"))
          if (f = s[l], typeof f == "object") L = f;
          else throw Error(Q + l + " not an object: " + f);
        if (s.hasOwnProperty(l = "ALPHABET"))
          if (f = s[l], typeof f == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(f))
            A = f.slice(0, 10) == "0123456789", _ = f;
          else
            throw Error(Q + l + " invalid: " + f);
      } else
        throw Error(Q + "Object expected: " + s);
    return {
      DECIMAL_PLACES: u,
      ROUNDING_MODE: a,
      EXPONENTIAL_AT: [h, c],
      RANGE: [M, d],
      CRYPTO: S,
      MODULO_MODE: O,
      POW_PRECISION: P,
      FORMAT: L,
      ALPHABET: _
    };
  }, m.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!m.DEBUG) return !0;
    var l, f, w = s.c, p = s.e, y = s.s;
    e: if ({}.toString.call(w) == "[object Array]") {
      if ((y === 1 || y === -1) && p >= -X && p <= X && p === re(p)) {
        if (w[0] === 0) {
          if (p === 0 && w.length === 1) return !0;
          break e;
        }
        if (l = (p + 1) % G, l < 1 && (l += G), String(w[0]).length == l) {
          for (l = 0; l < w.length; l++)
            if (f = w[l], f < 0 || f >= se || f !== re(f)) break e;
          if (f !== 0) return !0;
        }
      }
    } else if (w === null && p === null && (y === null || y === 1 || y === -1))
      return !0;
    throw Error(Q + "Invalid BigNumber: " + s);
  }, m.maximum = m.max = function() {
    return R(arguments, -1);
  }, m.minimum = m.min = function() {
    return R(arguments, 1);
  }, m.random = (function() {
    var s = 9007199254740992, l = Math.random() * s & 2097151 ? function() {
      return re(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(f) {
      var w, p, y, v, g, x = 0, E = [], b = new m(o);
      if (f == null ? f = u : z(f, 0, X), v = We(f / G), S)
        if (crypto.getRandomValues) {
          for (w = crypto.getRandomValues(new Uint32Array(v *= 2)); x < v; )
            g = w[x] * 131072 + (w[x + 1] >>> 11), g >= 9e15 ? (p = crypto.getRandomValues(new Uint32Array(2)), w[x] = p[0], w[x + 1] = p[1]) : (E.push(g % 1e14), x += 2);
          x = v / 2;
        } else if (crypto.randomBytes) {
          for (w = crypto.randomBytes(v *= 7); x < v; )
            g = (w[x] & 31) * 281474976710656 + w[x + 1] * 1099511627776 + w[x + 2] * 4294967296 + w[x + 3] * 16777216 + (w[x + 4] << 16) + (w[x + 5] << 8) + w[x + 6], g >= 9e15 ? crypto.randomBytes(7).copy(w, x) : (E.push(g % 1e14), x += 7);
          x = v / 7;
        } else
          throw S = !1, Error(Q + "crypto unavailable");
      if (!S)
        for (; x < v; )
          g = l(), g < 9e15 && (E[x++] = g % 1e14);
      for (v = E[--x], f %= G, v && f && (g = je[G - f], E[x] = re(v / g) * g); E[x] === 0; E.pop(), x--) ;
      if (x < 0)
        E = [y = 0];
      else {
        for (y = -1; E[0] === 0; E.splice(0, 1), y -= G) ;
        for (x = 1, g = E[0]; g >= 10; g /= 10, x++) ;
        x < G && (y -= G - x);
      }
      return b.e = y, b.c = E, b;
    };
  })(), m.sum = function() {
    for (var s = 1, l = arguments, f = new m(l[0]); s < l.length; ) f = f.plus(l[s++]);
    return f;
  }, r = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function l(f, w, p, y) {
      for (var v, g = [0], x, E = 0, b = f.length; E < b; ) {
        for (x = g.length; x--; g[x] *= w) ;
        for (g[0] += y.indexOf(f.charAt(E++)), v = 0; v < g.length; v++)
          g[v] > p - 1 && (g[v + 1] == null && (g[v + 1] = 0), g[v + 1] += g[v] / p | 0, g[v] %= p);
      }
      return g.reverse();
    }
    return function(f, w, p, y, v) {
      var g, x, E, b, N, B, I, q, U = f.indexOf("."), $ = u, H = a;
      for (U >= 0 && (b = P, P = 0, f = f.replace(".", ""), q = new m(w), B = q.pow(f.length - U), P = b, q.c = l(
        ce(te(B.c), B.e, "0"),
        10,
        p,
        s
      ), q.e = q.c.length), I = l(f, w, p, v ? (g = _, s) : (g = s, _)), E = b = I.length; I[--b] == 0; I.pop()) ;
      if (!I[0]) return g.charAt(0);
      if (U < 0 ? --E : (B.c = I, B.e = E, B.s = y, B = e(B, q, $, H, p), I = B.c, N = B.r, E = B.e), x = E + $ + 1, U = I[x], b = p / 2, N = N || x < 0 || I[x + 1] != null, N = H < 4 ? (U != null || N) && (H == 0 || H == (B.s < 0 ? 3 : 2)) : U > b || U == b && (H == 4 || N || H == 6 && I[x - 1] & 1 || H == (B.s < 0 ? 8 : 7)), x < 1 || !I[0])
        f = N ? ce(g.charAt(1), -$, g.charAt(0)) : g.charAt(0);
      else {
        if (I.length = x, N)
          for (--p; ++I[--x] > p; )
            I[x] = 0, x || (++E, I = [1].concat(I));
        for (b = I.length; !I[--b]; ) ;
        for (U = 0, f = ""; U <= b; f += g.charAt(I[U++])) ;
        f = ce(f, E, g.charAt(0));
      }
      return f;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(w, p, y) {
      var v, g, x, E, b = 0, N = w.length, B = p % ye, I = p / ye | 0;
      for (w = w.slice(); N--; )
        x = w[N] % ye, E = w[N] / ye | 0, v = I * x + E * B, g = B * x + v % ye * ye + b, b = (g / y | 0) + (v / ye | 0) + I * E, w[N] = g % y;
      return b && (w = [b].concat(w)), w;
    }
    function l(w, p, y, v) {
      var g, x;
      if (y != v)
        x = y > v ? 1 : -1;
      else
        for (g = x = 0; g < y; g++)
          if (w[g] != p[g]) {
            x = w[g] > p[g] ? 1 : -1;
            break;
          }
      return x;
    }
    function f(w, p, y, v) {
      for (var g = 0; y--; )
        w[y] -= g, g = w[y] < p[y] ? 1 : 0, w[y] = g * v + w[y] - p[y];
      for (; !w[0] && w.length > 1; w.splice(0, 1)) ;
    }
    return function(w, p, y, v, g) {
      var x, E, b, N, B, I, q, U, $, H, D, Y, ke, Je, Ze, le, Se, ee = w.s == p.s ? 1 : -1, Z = w.c, V = p.c;
      if (!Z || !Z[0] || !V || !V[0])
        return new m(
          // Return NaN if either NaN, or both Infinity or 0.
          !w.s || !p.s || (Z ? V && Z[0] == V[0] : !V) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            Z && Z[0] == 0 || !V ? ee * 0 : ee / 0
          )
        );
      for (U = new m(ee), $ = U.c = [], E = w.e - p.e, ee = y + E + 1, g || (g = se, E = ne(w.e / G) - ne(p.e / G), ee = ee / G | 0), b = 0; V[b] == (Z[b] || 0); b++) ;
      if (V[b] > (Z[b] || 0) && E--, ee < 0)
        $.push(1), N = !0;
      else {
        for (Je = Z.length, le = V.length, b = 0, ee += 2, B = re(g / (V[0] + 1)), B > 1 && (V = s(V, B, g), Z = s(Z, B, g), le = V.length, Je = Z.length), ke = le, H = Z.slice(0, le), D = H.length; D < le; H[D++] = 0) ;
        Se = V.slice(), Se = [0].concat(Se), Ze = V[0], V[1] >= g / 2 && Ze++;
        do {
          if (B = 0, x = l(V, H, le, D), x < 0) {
            if (Y = H[0], le != D && (Y = Y * g + (H[1] || 0)), B = re(Y / Ze), B > 1)
              for (B >= g && (B = g - 1), I = s(V, B, g), q = I.length, D = H.length; l(I, H, q, D) == 1; )
                B--, f(I, le < q ? Se : V, q, g), q = I.length, x = 1;
            else
              B == 0 && (x = B = 1), I = V.slice(), q = I.length;
            if (q < D && (I = [0].concat(I)), f(H, I, D, g), D = H.length, x == -1)
              for (; l(V, H, le, D) < 1; )
                B++, f(H, le < D ? Se : V, D, g), D = H.length;
          } else x === 0 && (B++, H = [0]);
          $[b++] = B, H[0] ? H[D++] = Z[ke] || 0 : (H = [Z[ke]], D = 1);
        } while ((ke++ < Je || H[0] != null) && ee--);
        N = H[0] != null, $[0] || $.splice(0, 1);
      }
      if (g == se) {
        for (b = 1, ee = $[0]; ee >= 10; ee /= 10, b++) ;
        C(U, y + (U.e = b + E * G - 1) + 1, v, N);
      } else
        U.e = E, U.r = +N;
      return U;
    };
  })();
  function F(s, l, f, w) {
    var p, y, v, g, x;
    if (f == null ? f = a : z(f, 0, 8), !s.c) return s.toString();
    if (p = s.c[0], v = s.e, l == null)
      x = te(s.c), x = w == 1 || w == 2 && (v <= h || v >= c) ? Be(x, v) : ce(x, v, "0");
    else if (s = C(new m(s), l, f), y = s.e, x = te(s.c), g = x.length, w == 1 || w == 2 && (l <= y || y <= h)) {
      for (; g < l; x += "0", g++) ;
      x = Be(x, y);
    } else if (l -= v + (w === 2 && y > v), x = ce(x, y, "0"), y + 1 > g) {
      if (--l > 0) for (x += "."; l--; x += "0") ;
    } else if (l += y - g, l > 0)
      for (y + 1 == g && (x += "."); l--; x += "0") ;
    return s.s < 0 && p ? "-" + x : x;
  }
  function R(s, l) {
    for (var f, w, p = 1, y = new m(s[0]); p < s.length; p++)
      w = new m(s[p]), (!w.s || (f = de(y, w)) === l || f === 0 && y.s === l) && (y = w);
    return y;
  }
  function T(s, l, f) {
    for (var w = 1, p = l.length; !l[--p]; l.pop()) ;
    for (p = l[0]; p >= 10; p /= 10, w++) ;
    return (f = w + f * G - 1) > d ? s.c = s.e = null : f < M ? s.c = [s.e = 0] : (s.e = f, s.c = l), s;
  }
  n = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, l = /^([^.]+)\\.$/, f = /^\\.([^.]+)$/, w = /^-?(Infinity|NaN)$/, p = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(y, v, g, x) {
      var E, b = g ? v : v.replace(p, "");
      if (w.test(b))
        y.s = isNaN(b) ? null : b < 0 ? -1 : 1;
      else {
        if (!g && (b = b.replace(s, function(N, B, I) {
          return E = (I = I.toLowerCase()) == "x" ? 16 : I == "b" ? 2 : 8, !x || x == E ? B : N;
        }), x && (E = x, b = b.replace(l, "$1").replace(f, "0.$1")), v != b))
          return new m(b, E);
        if (m.DEBUG)
          throw Error(Q + "Not a" + (x ? " base " + x : "") + " number: " + v);
        y.s = null;
      }
      y.c = y.e = null;
    };
  })();
  function C(s, l, f, w) {
    var p, y, v, g, x, E, b, N = s.c, B = je;
    if (N) {
      e: {
        for (p = 1, g = N[0]; g >= 10; g /= 10, p++) ;
        if (y = l - p, y < 0)
          y += G, v = l, x = N[E = 0], b = re(x / B[p - v - 1] % 10);
        else if (E = We((y + 1) / G), E >= N.length)
          if (w) {
            for (; N.length <= E; N.push(0)) ;
            x = b = 0, p = 1, y %= G, v = y - G + 1;
          } else
            break e;
        else {
          for (x = g = N[E], p = 1; g >= 10; g /= 10, p++) ;
          y %= G, v = y - G + p, b = v < 0 ? 0 : re(x / B[p - v - 1] % 10);
        }
        if (w = w || l < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        N[E + 1] != null || (v < 0 ? x : x % B[p - v - 1]), w = f < 4 ? (b || w) && (f == 0 || f == (s.s < 0 ? 3 : 2)) : b > 5 || b == 5 && (f == 4 || w || f == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? v > 0 ? x / B[p - v] : 0 : N[E - 1]) % 10 & 1 || f == (s.s < 0 ? 8 : 7)), l < 1 || !N[0])
          return N.length = 0, w ? (l -= s.e + 1, N[0] = B[(G - l % G) % G], s.e = -l || 0) : N[0] = s.e = 0, s;
        if (y == 0 ? (N.length = E, g = 1, E--) : (N.length = E + 1, g = B[G - y], N[E] = v > 0 ? re(x / B[p - v] % B[v]) * g : 0), w)
          for (; ; )
            if (E == 0) {
              for (y = 1, v = N[0]; v >= 10; v /= 10, y++) ;
              for (v = N[0] += g, g = 1; v >= 10; v /= 10, g++) ;
              y != g && (s.e++, N[0] == se && (N[0] = 1));
              break;
            } else {
              if (N[E] += g, N[E] != se) break;
              N[E--] = 0, g = 1;
            }
        for (y = N.length; N[--y] === 0; N.pop()) ;
      }
      s.e > d ? s.c = s.e = null : s.e < M && (s.c = [s.e = 0]);
    }
    return s;
  }
  function k(s) {
    var l, f = s.e;
    return f === null ? s.toString() : (l = te(s.c), l = f <= h || f >= c ? Be(l, f) : ce(l, f, "0"), s.s < 0 ? "-" + l : l);
  }
  return i.absoluteValue = i.abs = function() {
    var s = new m(this);
    return s.s < 0 && (s.s = 1), s;
  }, i.comparedTo = function(s, l) {
    return de(this, new m(s, l));
  }, i.decimalPlaces = i.dp = function(s, l) {
    var f, w, p, y = this;
    if (s != null)
      return z(s, 0, X), l == null ? l = a : z(l, 0, 8), C(new m(y), s + y.e + 1, l);
    if (!(f = y.c)) return null;
    if (w = ((p = f.length - 1) - ne(this.e / G)) * G, p = f[p]) for (; p % 10 == 0; p /= 10, w--) ;
    return w < 0 && (w = 0), w;
  }, i.dividedBy = i.div = function(s, l) {
    return e(this, new m(s, l), u, a);
  }, i.dividedToIntegerBy = i.idiv = function(s, l) {
    return e(this, new m(s, l), 0, 1);
  }, i.exponentiatedBy = i.pow = function(s, l) {
    var f, w, p, y, v, g, x, E, b, N = this;
    if (s = new m(s), s.c && !s.isInteger())
      throw Error(Q + "Exponent not an integer: " + k(s));
    if (l != null && (l = new m(l)), g = s.e > 14, !N.c || !N.c[0] || N.c[0] == 1 && !N.e && N.c.length == 1 || !s.c || !s.c[0])
      return b = new m(Math.pow(+k(N), g ? s.s * (2 - Fe(s)) : +k(s))), l ? b.mod(l) : b;
    if (x = s.s < 0, l) {
      if (l.c ? !l.c[0] : !l.s) return new m(NaN);
      w = !x && N.isInteger() && l.isInteger(), w && (N = N.mod(l));
    } else {
      if (s.e > 9 && (N.e > 0 || N.e < -1 || (N.e == 0 ? N.c[0] > 1 || g && N.c[1] >= 24e7 : N.c[0] < 8e13 || g && N.c[0] <= 9999975e7)))
        return y = N.s < 0 && Fe(s) ? -0 : 0, N.e > -1 && (y = 1 / y), new m(x ? 1 / y : y);
      P && (y = We(P / G + 2));
    }
    for (g ? (f = new m(0.5), x && (s.s = 1), E = Fe(s)) : (p = Math.abs(+k(s)), E = p % 2), b = new m(o); ; ) {
      if (E) {
        if (b = b.times(N), !b.c) break;
        y ? b.c.length > y && (b.c.length = y) : w && (b = b.mod(l));
      }
      if (p) {
        if (p = re(p / 2), p === 0) break;
        E = p % 2;
      } else if (s = s.times(f), C(s, s.e + 1, 1), s.e > 14)
        E = Fe(s);
      else {
        if (p = +k(s), p === 0) break;
        E = p % 2;
      }
      N = N.times(N), y ? N.c && N.c.length > y && (N.c.length = y) : w && (N = N.mod(l));
    }
    return w ? b : (x && (b = o.div(b)), l ? b.mod(l) : y ? C(b, P, a, v) : b);
  }, i.integerValue = function(s) {
    var l = new m(this);
    return s == null ? s = a : z(s, 0, 8), C(l, l.e + 1, s);
  }, i.isEqualTo = i.eq = function(s, l) {
    return de(this, new m(s, l)) === 0;
  }, i.isFinite = function() {
    return !!this.c;
  }, i.isGreaterThan = i.gt = function(s, l) {
    return de(this, new m(s, l)) > 0;
  }, i.isGreaterThanOrEqualTo = i.gte = function(s, l) {
    return (l = de(this, new m(s, l))) === 1 || l === 0;
  }, i.isInteger = function() {
    return !!this.c && ne(this.e / G) > this.c.length - 2;
  }, i.isLessThan = i.lt = function(s, l) {
    return de(this, new m(s, l)) < 0;
  }, i.isLessThanOrEqualTo = i.lte = function(s, l) {
    return (l = de(this, new m(s, l))) === -1 || l === 0;
  }, i.isNaN = function() {
    return !this.s;
  }, i.isNegative = function() {
    return this.s < 0;
  }, i.isPositive = function() {
    return this.s > 0;
  }, i.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, i.minus = function(s, l) {
    var f, w, p, y, v = this, g = v.s;
    if (s = new m(s, l), l = s.s, !g || !l) return new m(NaN);
    if (g != l)
      return s.s = -l, v.plus(s);
    var x = v.e / G, E = s.e / G, b = v.c, N = s.c;
    if (!x || !E) {
      if (!b || !N) return b ? (s.s = -l, s) : new m(N ? v : NaN);
      if (!b[0] || !N[0])
        return N[0] ? (s.s = -l, s) : new m(b[0] ? v : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          a == 3 ? -0 : 0
        ));
    }
    if (x = ne(x), E = ne(E), b = b.slice(), g = x - E) {
      for ((y = g < 0) ? (g = -g, p = b) : (E = x, p = N), p.reverse(), l = g; l--; p.push(0)) ;
      p.reverse();
    } else
      for (w = (y = (g = b.length) < (l = N.length)) ? g : l, g = l = 0; l < w; l++)
        if (b[l] != N[l]) {
          y = b[l] < N[l];
          break;
        }
    if (y && (p = b, b = N, N = p, s.s = -s.s), l = (w = N.length) - (f = b.length), l > 0) for (; l--; b[f++] = 0) ;
    for (l = se - 1; w > g; ) {
      if (b[--w] < N[w]) {
        for (f = w; f && !b[--f]; b[f] = l) ;
        --b[f], b[w] += se;
      }
      b[w] -= N[w];
    }
    for (; b[0] == 0; b.splice(0, 1), --E) ;
    return b[0] ? T(s, b, E) : (s.s = a == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, i.modulo = i.mod = function(s, l) {
    var f, w, p = this;
    return s = new m(s, l), !p.c || !s.s || s.c && !s.c[0] ? new m(NaN) : !s.c || p.c && !p.c[0] ? new m(p) : (O == 9 ? (w = s.s, s.s = 1, f = e(p, s, 0, 3), s.s = w, f.s *= w) : f = e(p, s, 0, O), s = p.minus(f.times(s)), !s.c[0] && O == 1 && (s.s = p.s), s);
  }, i.multipliedBy = i.times = function(s, l) {
    var f, w, p, y, v, g, x, E, b, N, B, I, q, U, $, H = this, D = H.c, Y = (s = new m(s, l)).c;
    if (!D || !Y || !D[0] || !Y[0])
      return !H.s || !s.s || D && !D[0] && !Y || Y && !Y[0] && !D ? s.c = s.e = s.s = null : (s.s *= H.s, !D || !Y ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (w = ne(H.e / G) + ne(s.e / G), s.s *= H.s, x = D.length, N = Y.length, x < N && (q = D, D = Y, Y = q, p = x, x = N, N = p), p = x + N, q = []; p--; q.push(0)) ;
    for (U = se, $ = ye, p = N; --p >= 0; ) {
      for (f = 0, B = Y[p] % $, I = Y[p] / $ | 0, v = x, y = p + v; y > p; )
        E = D[--v] % $, b = D[v] / $ | 0, g = I * E + b * B, E = B * E + g % $ * $ + q[y] + f, f = (E / U | 0) + (g / $ | 0) + I * b, q[y--] = E % U;
      q[y] = f;
    }
    return f ? ++w : q.splice(0, 1), T(s, q, w);
  }, i.negated = function() {
    var s = new m(this);
    return s.s = -s.s || null, s;
  }, i.plus = function(s, l) {
    var f, w = this, p = w.s;
    if (s = new m(s, l), l = s.s, !p || !l) return new m(NaN);
    if (p != l)
      return s.s = -l, w.minus(s);
    var y = w.e / G, v = s.e / G, g = w.c, x = s.c;
    if (!y || !v) {
      if (!g || !x) return new m(p / 0);
      if (!g[0] || !x[0]) return x[0] ? s : new m(g[0] ? w : p * 0);
    }
    if (y = ne(y), v = ne(v), g = g.slice(), p = y - v) {
      for (p > 0 ? (v = y, f = x) : (p = -p, f = g), f.reverse(); p--; f.push(0)) ;
      f.reverse();
    }
    for (p = g.length, l = x.length, p - l < 0 && (f = x, x = g, g = f, l = p), p = 0; l; )
      p = (g[--l] = g[l] + x[l] + p) / se | 0, g[l] = se === g[l] ? 0 : g[l] % se;
    return p && (g = [p].concat(g), ++v), T(s, g, v);
  }, i.precision = i.sd = function(s, l) {
    var f, w, p, y = this;
    if (s != null && s !== !!s)
      return z(s, 1, X), l == null ? l = a : z(l, 0, 8), C(new m(y), s, l);
    if (!(f = y.c)) return null;
    if (p = f.length - 1, w = p * G + 1, p = f[p]) {
      for (; p % 10 == 0; p /= 10, w--) ;
      for (p = f[0]; p >= 10; p /= 10, w++) ;
    }
    return s && y.e + 1 > w && (w = y.e + 1), w;
  }, i.shiftedBy = function(s) {
    return z(s, -Qe, Qe), this.times("1e" + s);
  }, i.squareRoot = i.sqrt = function() {
    var s, l, f, w, p, y = this, v = y.c, g = y.s, x = y.e, E = u + 4, b = new m("0.5");
    if (g !== 1 || !v || !v[0])
      return new m(!g || g < 0 && (!v || v[0]) ? NaN : v ? y : 1 / 0);
    if (g = Math.sqrt(+k(y)), g == 0 || g == 1 / 0 ? (l = te(v), (l.length + x) % 2 == 0 && (l += "0"), g = Math.sqrt(+l), x = ne((x + 1) / 2) - (x < 0 || x % 2), g == 1 / 0 ? l = "5e" + x : (l = g.toExponential(), l = l.slice(0, l.indexOf("e") + 1) + x), f = new m(l)) : f = new m(g + ""), f.c[0]) {
      for (x = f.e, g = x + E, g < 3 && (g = 0); ; )
        if (p = f, f = b.times(p.plus(e(y, p, E, 1))), te(p.c).slice(0, g) === (l = te(f.c)).slice(0, g))
          if (f.e < x && --g, l = l.slice(g - 3, g + 1), l == "9999" || !w && l == "4999") {
            if (!w && (C(p, p.e + u + 2, 0), p.times(p).eq(y))) {
              f = p;
              break;
            }
            E += 4, g += 4, w = 1;
          } else {
            (!+l || !+l.slice(1) && l.charAt(0) == "5") && (C(f, f.e + u + 2, 1), s = !f.times(f).eq(y));
            break;
          }
    }
    return C(f, f.e + u + 1, a, s);
  }, i.toExponential = function(s, l) {
    return s != null && (z(s, 0, X), s++), F(this, s, l, 1);
  }, i.toFixed = function(s, l) {
    return s != null && (z(s, 0, X), s = s + this.e + 1), F(this, s, l);
  }, i.toFormat = function(s, l, f) {
    var w, p = this;
    if (f == null)
      s != null && l && typeof l == "object" ? (f = l, l = null) : s && typeof s == "object" ? (f = s, s = l = null) : f = L;
    else if (typeof f != "object")
      throw Error(Q + "Argument not an object: " + f);
    if (w = p.toFixed(s, l), p.c) {
      var y, v = w.split("."), g = +f.groupSize, x = +f.secondaryGroupSize, E = f.groupSeparator || "", b = v[0], N = v[1], B = p.s < 0, I = B ? b.slice(1) : b, q = I.length;
      if (x && (y = g, g = x, x = y, q -= y), g > 0 && q > 0) {
        for (y = q % g || g, b = I.substr(0, y); y < q; y += g) b += E + I.substr(y, g);
        x > 0 && (b += E + I.slice(y)), B && (b = "-" + b);
      }
      w = N ? b + (f.decimalSeparator || "") + ((x = +f.fractionGroupSize) ? N.replace(
        new RegExp("\\\\d{" + x + "}\\\\B", "g"),
        "$&" + (f.fractionGroupSeparator || "")
      ) : N) : b;
    }
    return (f.prefix || "") + w + (f.suffix || "");
  }, i.toFraction = function(s) {
    var l, f, w, p, y, v, g, x, E, b, N, B, I = this, q = I.c;
    if (s != null && (g = new m(s), !g.isInteger() && (g.c || g.s !== 1) || g.lt(o)))
      throw Error(Q + "Argument " + (g.isInteger() ? "out of range: " : "not an integer: ") + k(g));
    if (!q) return new m(I);
    for (l = new m(o), E = f = new m(o), w = x = new m(o), B = te(q), y = l.e = B.length - I.e - 1, l.c[0] = je[(v = y % G) < 0 ? G + v : v], s = !s || g.comparedTo(l) > 0 ? y > 0 ? l : E : g, v = d, d = 1 / 0, g = new m(B), x.c[0] = 0; b = e(g, l, 0, 1), p = f.plus(b.times(w)), p.comparedTo(s) != 1; )
      f = w, w = p, E = x.plus(b.times(p = E)), x = p, l = g.minus(b.times(p = l)), g = p;
    return p = e(s.minus(f), w, 0, 1), x = x.plus(p.times(E)), f = f.plus(p.times(w)), x.s = E.s = I.s, y = y * 2, N = e(E, w, y, a).minus(I).abs().comparedTo(
      e(x, f, y, a).minus(I).abs()
    ) < 1 ? [E, w] : [x, f], d = v, N;
  }, i.toNumber = function() {
    return +k(this);
  }, i.toPrecision = function(s, l) {
    return s != null && z(s, 1, X), F(this, s, l, 2);
  }, i.toString = function(s) {
    var l, f = this, w = f.s, p = f.e;
    return p === null ? w ? (l = "Infinity", w < 0 && (l = "-" + l)) : l = "NaN" : (s == null ? l = p <= h || p >= c ? Be(te(f.c), p) : ce(te(f.c), p, "0") : s === 10 && A ? (f = C(new m(f), u + p + 1, a), l = ce(te(f.c), f.e, "0")) : (z(s, 2, _.length, "Base"), l = r(ce(te(f.c), p, "0"), 10, s, w, !0)), w < 0 && f.c[0] && (l = "-" + l)), l;
  }, i.valueOf = i.toJSON = function() {
    return k(this);
  }, i._isBigNumber = !0, i[Symbol.toStringTag] = "BigNumber", i[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = i.valueOf, t != null && m.set(t), m;
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
  var r, n, i = t.c, o = e.c, u = t.s, a = e.s, h = t.e, c = e.e;
  if (!u || !a) return null;
  if (r = i && !i[0], n = o && !o[0], r || n) return r ? n ? 0 : -a : u;
  if (u != a) return u;
  if (r = u < 0, n = h == c, !i || !o) return n ? 0 : !i ^ r ? 1 : -1;
  if (!n) return h > c ^ r ? 1 : -1;
  for (a = (h = i.length) < (c = o.length) ? h : c, u = 0; u < a; u++) if (i[u] != o[u]) return i[u] > o[u] ^ r ? 1 : -1;
  return h == c ? 0 : h > c ^ r ? 1 : -1;
}
function z(t, e, r, n) {
  if (t < e || t > r || t !== re(t))
    throw Error(Q + (n || "Argument") + (typeof t == "number" ? t < e || t > r ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(t));
}
function Fe(t) {
  var e = t.c.length - 1;
  return ne(t.e / G) == e && t.c[e] % 2 != 0;
}
function Be(t, e) {
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
}, Pe = class extends Jt {
  constructor(t) {
    super(t);
  }
}, Zt = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(t) {
    const e = this.root;
    if (e == null)
      return this.compare(t, t), -1;
    let r = null, n = null, i = null, o = null, u = e;
    const a = this.compare;
    let h;
    for (; ; )
      if (h = a(u.key, t), h > 0) {
        let c = u.left;
        if (c == null || (h = a(c.key, t), h > 0 && (u.left = c.right, c.right = u, u = c, c = u.left, c == null)))
          break;
        r == null ? n = u : r.left = u, r = u, u = c;
      } else if (h < 0) {
        let c = u.right;
        if (c == null || (h = a(c.key, t), h < 0 && (u.right = c.left, c.left = u, u = c, c = u.right, c == null)))
          break;
        i == null ? o = u : i.right = u, i = u, u = c;
      } else
        break;
    return i != null && (i.right = u.left, u.left = o), r != null && (r.left = u.right, u.right = n), this.root !== u && (this.root = u, this.splayCount++), h;
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
}, ze = class Ae extends Zt {
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
    return r != 0 && this.addNewRoot(new Pe(e), r), this;
  }
  addAndReturn(e) {
    const r = this.splay(e);
    return r != 0 && this.addNewRoot(new Pe(e), r), this.root.key;
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
    const r = new Ae(this.compare, this.validKey), n = this.modificationCount;
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
    const r = new Ae(this.compare, this.validKey);
    for (const n of this)
      e.has(n) && r.add(n);
    return r;
  }
  difference(e) {
    const r = new Ae(this.compare, this.validKey);
    for (const n of this)
      e.has(n) || r.add(n);
    return r;
  }
  union(e) {
    const r = this.clone();
    return r.addAll(e), r;
  }
  clone() {
    const e = new Ae(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function r(i, o) {
      let u, a;
      do {
        if (u = i.left, a = i.right, u != null) {
          const h = new Pe(u.key);
          o.left = h, r(u, h);
        }
        if (a != null) {
          const h = new Pe(a.key);
          o.right = h, i = a, o = h;
        }
      } while (a != null);
    }
    const n = new Pe(e.key);
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
    return new Wt(this.wrap());
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
}, Wt = class extends It {
  getValue(t) {
    return t.key;
  }
}, Qt = class extends It {
  getValue(t) {
    return [t.key, t.key];
  }
}, Gt = (t) => () => t, it = (t) => {
  const e = t ? (r, n) => n.minus(r).abs().isLessThanOrEqualTo(t) : Gt(!1);
  return (r, n) => e(r, n) ? 0 : r.comparedTo(n);
};
function jt(t) {
  const e = t ? (r, n, i, o, u) => r.exponentiatedBy(2).isLessThanOrEqualTo(
    o.minus(n).exponentiatedBy(2).plus(u.minus(i).exponentiatedBy(2)).times(t)
  ) : Gt(!1);
  return (r, n, i) => {
    const o = r.x, u = r.y, a = i.x, h = i.y, c = u.minus(h).times(n.x.minus(a)).minus(o.minus(a).times(n.y.minus(h)));
    return e(c, o, u, a, h) ? 0 : c.comparedTo(0);
  };
}
var er = (t) => t, tr = (t) => {
  if (t) {
    const e = new ze(it(t)), r = new ze(it(t)), n = (o, u) => u.addAndReturn(o), i = (o) => ({
      x: n(o.x, e),
      y: n(o.y, r)
    });
    return i({ x: new fe(0), y: new fe(0) }), i;
  }
  return er;
}, st = (t) => ({
  set: (e) => {
    pe = st(e);
  },
  reset: () => st(t),
  compare: it(t),
  snap: tr(t),
  orient: jt(t)
}), pe = st(), Me = (t, e) => t.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(t.ur.x) && t.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(t.ur.y), ot = (t, e) => {
  if (e.ur.x.isLessThan(t.ll.x) || t.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(t.ll.y) || t.ur.y.isLessThan(e.ll.y))
    return null;
  const r = t.ll.x.isLessThan(e.ll.x) ? e.ll.x : t.ll.x, n = t.ur.x.isLessThan(e.ur.x) ? t.ur.x : e.ur.x, i = t.ll.y.isLessThan(e.ll.y) ? e.ll.y : t.ll.y, o = t.ur.y.isLessThan(e.ur.y) ? t.ur.y : e.ur.y;
  return { ll: { x: r, y: i }, ur: { x: n, y: o } };
}, He = (t, e) => t.x.times(e.y).minus(t.y.times(e.x)), qt = (t, e) => t.x.times(e.x).plus(t.y.times(e.y)), Ke = (t) => qt(t, t).sqrt(), rr = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return He(i, n).div(Ke(i)).div(Ke(n));
}, nr = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return qt(i, n).div(Ke(i)).div(Ke(n));
}, gt = (t, e, r) => e.y.isZero() ? null : { x: t.x.plus(e.x.div(e.y).times(r.minus(t.y))), y: r }, yt = (t, e, r) => e.x.isZero() ? null : { x: r, y: t.y.plus(e.y.div(e.x).times(r.minus(t.x))) }, ir = (t, e, r, n) => {
  if (e.x.isZero()) return yt(r, n, t.x);
  if (n.x.isZero()) return yt(t, e, r.x);
  if (e.y.isZero()) return gt(r, n, t.y);
  if (n.y.isZero()) return gt(t, e, r.y);
  const i = He(e, n);
  if (i.isZero()) return null;
  const o = { x: r.x.minus(t.x), y: r.y.minus(t.y) }, u = He(o, e).div(i), a = He(o, n).div(i), h = t.x.plus(a.times(e.x)), c = r.x.plus(u.times(n.x)), M = t.y.plus(a.times(e.y)), d = r.y.plus(u.times(n.y)), S = h.plus(c).div(2), O = M.plus(d).div(2);
  return { x: S, y: O };
}, ae = class Ht {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, r) {
    const n = Ht.comparePoints(e.point, r.point);
    return n !== 0 ? n : (e.point !== r.point && e.link(r), e.isLeft !== r.isLeft ? e.isLeft ? 1 : -1 : Ve.compare(e.segment, r.segment));
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
      const { sine: u, cosine: a } = r.get(i), { sine: h, cosine: c } = r.get(o);
      return u.isGreaterThanOrEqualTo(0) && h.isGreaterThanOrEqualTo(0) ? a.isLessThan(c) ? 1 : a.isGreaterThan(c) ? -1 : 0 : u.isLessThan(0) && h.isLessThan(0) ? a.isLessThan(c) ? -1 : a.isGreaterThan(c) ? 1 : 0 : h.isLessThan(u) ? -1 : h.isGreaterThan(u) ? 1 : 0;
    };
  }
}, sr = class lt {
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
      let u = null, a = o.leftSE, h = o.rightSE;
      const c = [a], M = a.point, d = [];
      for (; u = a, a = h, c.push(a), a.point !== M; )
        for (; ; ) {
          const S = a.getAvailableLinkedEvents();
          if (S.length === 0) {
            const L = c[0].point, _ = c[c.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${L.x}, \${L.y}]. Last matching segment found ends at [\${_.x}, \${_.y}].\`
            );
          }
          if (S.length === 1) {
            h = S[0].otherSE;
            break;
          }
          let O = null;
          for (let L = 0, _ = d.length; L < _; L++)
            if (d[L].point === a.point) {
              O = L;
              break;
            }
          if (O !== null) {
            const L = d.splice(O)[0], _ = c.splice(L.index);
            _.unshift(_[0].otherSE), r.push(new lt(_.reverse()));
            continue;
          }
          d.push({
            index: c.length,
            point: a.point
          });
          const P = a.getLeftmostComparator(u);
          h = S.sort(P)[0].otherSE;
          break;
        }
      r.push(new lt(c));
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
      const d = this.events[c].point, S = this.events[c + 1].point;
      pe.orient(d, e, S) !== 0 && (r.push(d), e = d);
    }
    if (r.length === 1) return null;
    const n = r[0], i = r[1];
    pe.orient(n, e, i) === 0 && r.shift(), r.push(r[0]);
    const o = this.isExteriorRing() ? 1 : -1, u = this.isExteriorRing() ? 0 : r.length - 1, a = this.isExteriorRing() ? r.length : -1, h = [];
    for (let c = u; c != a; c += o)
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
      const u = this.events[i];
      ae.compare(e, u) > 0 && (e = u);
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
}, dt = class {
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
        if (i.isExteriorRing()) e.push(new dt(i));
        else {
          const o = i.enclosingRing();
          o?.poly || e.push(new dt(o)), o?.poly?.addInterior(i);
        }
    }
    return e;
  }
}, lr = class {
  queue;
  tree;
  segments;
  constructor(t, e = Ve.compare) {
    this.queue = t, this.tree = new ze(e), this.segments = [];
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
      let u = null;
      if (i) {
        const a = i.getIntersection(e);
        if (a !== null && (e.isAnEndpoint(a) || (u = a), !i.isAnEndpoint(a))) {
          const h = this._splitSafely(i, a);
          for (let c = 0, M = h.length; c < M; c++)
            r.push(h[c]);
        }
      }
      if (o !== null || u !== null) {
        let a = null;
        o === null ? a = u : u === null ? a = o : a = ae.comparePoints(
          o,
          u
        ) <= 0 ? o : u, this.queue.delete(e.rightSE), r.push(e.rightSE);
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
            const u = this._splitSafely(n, o);
            for (let a = 0, h = u.length; a < h; a++)
              r.push(u[a]);
          }
          if (!i.isAnEndpoint(o)) {
            const u = this._splitSafely(i, o);
            for (let a = 0, h = u.length; a < h; a++)
              r.push(u[a]);
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
    _e.type = t;
    const n = [new wt(e, !0)];
    for (let c = 0, M = r.length; c < M; c++)
      n.push(new wt(r[c], !1));
    if (_e.numMultiPolys = n.length, _e.type === "difference") {
      const c = n[0];
      let M = 1;
      for (; M < n.length; )
        ot(n[M].bbox, c.bbox) !== null ? M++ : n.splice(M, 1);
    }
    if (_e.type === "intersection")
      for (let c = 0, M = n.length; c < M; c++) {
        const d = n[c];
        for (let S = c + 1, O = n.length; S < O; S++)
          if (ot(d.bbox, n[S].bbox) === null) return [];
      }
    const i = new ze(ae.compare);
    for (let c = 0, M = n.length; c < M; c++) {
      const d = n[c].getSweepEvents();
      for (let S = 0, O = d.length; S < O; S++)
        i.add(d[S]);
    }
    const o = new lr(i);
    let u = null;
    for (i.size != 0 && (u = i.first(), i.delete(u)); u; ) {
      const c = o.process(u);
      for (let M = 0, d = c.length; M < d; M++) {
        const S = c[M];
        S.consumedBy === void 0 && i.add(S);
      }
      i.size != 0 ? (u = i.first(), i.delete(u)) : u = null;
    }
    pe.reset();
    const a = sr.factory(o.segments);
    return new or(a).getGeom();
  }
}, _e = new ur(), ut = _e, ar = 0, Ve = class De {
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
    const n = e.leftSE.point.x, i = r.leftSE.point.x, o = e.rightSE.point.x, u = r.rightSE.point.x;
    if (u.isLessThan(n)) return 1;
    if (o.isLessThan(i)) return -1;
    const a = e.leftSE.point.y, h = r.leftSE.point.y, c = e.rightSE.point.y, M = r.rightSE.point.y;
    if (n.isLessThan(i)) {
      if (h.isLessThan(a) && h.isLessThan(c)) return 1;
      if (h.isGreaterThan(a) && h.isGreaterThan(c)) return -1;
      const d = e.comparePoint(r.leftSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
      const S = r.comparePoint(e.rightSE.point);
      return S !== 0 ? S : -1;
    }
    if (n.isGreaterThan(i)) {
      if (a.isLessThan(h) && a.isLessThan(M)) return -1;
      if (a.isGreaterThan(h) && a.isGreaterThan(M)) return 1;
      const d = r.comparePoint(e.leftSE.point);
      if (d !== 0) return d;
      const S = e.comparePoint(r.rightSE.point);
      return S < 0 ? 1 : S > 0 ? -1 : 1;
    }
    if (a.isLessThan(h)) return -1;
    if (a.isGreaterThan(h)) return 1;
    if (o.isLessThan(u)) {
      const d = r.comparePoint(e.rightSE.point);
      if (d !== 0) return d;
    }
    if (o.isGreaterThan(u)) {
      const d = e.comparePoint(r.rightSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
    }
    if (!o.eq(u)) {
      const d = c.minus(a), S = o.minus(n), O = M.minus(h), P = u.minus(i);
      if (d.isGreaterThan(S) && O.isLessThan(P)) return 1;
      if (d.isLessThan(S) && O.isGreaterThan(P)) return -1;
    }
    return o.isGreaterThan(u) ? 1 : o.isLessThan(u) || c.isLessThan(M) ? -1 : c.isGreaterThan(M) ? 1 : e.id < r.id ? -1 : e.id > r.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, r, n, i) {
    this.id = ++ar, this.leftSE = e, e.segment = this, e.otherSE = r, this.rightSE = r, r.segment = this, r.otherSE = e, this.rings = n, this.windings = i;
  }
  static fromRing(e, r, n) {
    let i, o, u;
    const a = ae.comparePoints(e, r);
    if (a < 0)
      i = e, o = r, u = 1;
    else if (a > 0)
      i = r, o = e, u = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const h = new ae(i, !0), c = new ae(o, !1);
    return new De(h, c, [n], [u]);
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
    const r = this.bbox(), n = e.bbox(), i = ot(r, n);
    if (i === null) return null;
    const o = this.leftSE.point, u = this.rightSE.point, a = e.leftSE.point, h = e.rightSE.point, c = Me(r, a) && this.comparePoint(a) === 0, M = Me(n, o) && e.comparePoint(o) === 0, d = Me(r, h) && this.comparePoint(h) === 0, S = Me(n, u) && e.comparePoint(u) === 0;
    if (M && c)
      return S && !d ? u : !S && d ? h : null;
    if (M)
      return d && o.x.eq(h.x) && o.y.eq(h.y) ? null : o;
    if (c)
      return S && u.x.eq(a.x) && u.y.eq(a.y) ? null : a;
    if (S && d) return null;
    if (S) return u;
    if (d) return h;
    const O = ir(o, this.vector(), a, e.vector());
    return O === null || !Me(i, O) ? null : pe.snap(O);
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
    const r = [], n = e.events !== void 0, i = new ae(e, !0), o = new ae(e, !1), u = this.rightSE;
    this.replaceRightSE(o), r.push(o), r.push(i);
    const a = new De(
      i,
      u,
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
    const i = De.compare(r, n);
    if (i !== 0) {
      if (i > 0) {
        const o = r;
        r = n, n = o;
      }
      if (r.prev === n) {
        const o = r;
        r = n, n = o;
      }
      for (let o = 0, u = n.rings.length; o < u; o++) {
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
    const o = [], u = [];
    for (let a = 0, h = r.length; a < h; a++) {
      if (n[a] === 0) continue;
      const c = r[a], M = c.poly;
      if (u.indexOf(M) === -1)
        if (c.isExterior) o.push(M);
        else {
          u.indexOf(M) === -1 && u.push(M);
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
    switch (ut.type) {
      case "union": {
        const n = e.length === 0, i = r.length === 0;
        this._isInResult = n !== i;
        break;
      }
      case "intersection": {
        let n, i;
        e.length < r.length ? (n = e.length, i = r.length) : (n = r.length, i = e.length), this._isInResult = i === ut.numMultiPolys && n < i;
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
}, mt = class {
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
    for (let o = 1, u = t.length; o < u; o++) {
      if (typeof t[o][0] != "number" || typeof t[o][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const a = pe.snap({ x: new fe(t[o][0]), y: new fe(t[o][1]) });
      a.x.eq(i.x) && a.y.eq(i.y) || (this.segments.push(Ve.fromRing(i, a, this)), a.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = a.x), a.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = a.y), a.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = a.x), a.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = a.y), i = a);
    }
    (!n.x.eq(i.x) || !n.y.eq(i.y)) && this.segments.push(Ve.fromRing(i, n, this));
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
    this.exteriorRing = new mt(t[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let r = 1, n = t.length; r < n; r++) {
      const i = new mt(t[r], this, !1);
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
}, wt = class {
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
}, cr = (t, ...e) => ut.run("union", t, e);
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
function Oe(t, e, r = {}) {
  if (!t)
    throw new Error("coordinates is required");
  if (!Array.isArray(t))
    throw new Error("coordinates must be an Array");
  if (t.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!vt(t[0]) || !vt(t[1]))
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
function xt(t, e, r = {}) {
  if (t.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return ge({
    type: "LineString",
    coordinates: t
  }, e, r);
}
function Ee(t, e = {}) {
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
function Ie(t) {
  return t % 360 * Math.PI / 180;
}
function vt(t) {
  return !isNaN(t) && t !== null && !Array.isArray(t);
}
function dr(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function Ne(t, e, r) {
  if (t !== null)
    for (var n, i, o, u, a, h, c, M = 0, d = 0, S, O = t.type, P = O === "FeatureCollection", L = O === "Feature", _ = P ? t.features.length : 1, A = 0; A < _; A++) {
      c = P ? (
        // @ts-expect-error: Known type conflict
        t.features[A].geometry
      ) : L ? (
        // @ts-expect-error: Known type conflict
        t.geometry
      ) : t, S = c ? c.type === "GeometryCollection" : !1, a = S ? c.geometries.length : 1;
      for (var m = 0; m < a; m++) {
        var F = 0, R = 0;
        if (u = S ? c.geometries[m] : c, u !== null) {
          h = u.coordinates;
          var T = u.type;
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
                  F,
                  R
                ) === !1
              )
                return !1;
              d++, F++;
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
                    F,
                    R
                  ) === !1
                )
                  return !1;
                d++, T === "MultiPoint" && F++;
              }
              T === "LineString" && F++;
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
                      F,
                      R
                    ) === !1
                  )
                    return !1;
                  d++;
                }
                T === "MultiLineString" && F++, T === "Polygon" && R++;
              }
              T === "Polygon" && F++;
              break;
            case "MultiPolygon":
              for (n = 0; n < h.length; n++) {
                for (R = 0, i = 0; i < h[n].length; i++) {
                  for (o = 0; o < h[n][i].length - M; o++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      e(
                        h[n][i][o],
                        d,
                        A,
                        F,
                        R
                      ) === !1
                    )
                      return !1;
                    d++;
                  }
                  R++;
                }
                F++;
              }
              break;
            case "GeometryCollection":
              for (n = 0; n < u.geometries.length; n++)
                if (
                  // @ts-expect-error: Known type conflict
                  Ne(u.geometries[n], e) === !1
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
function ft(t, e) {
  if (t.type === "Feature")
    e(t, 0);
  else if (t.type === "FeatureCollection")
    for (var r = 0; r < t.features.length && e(t.features[r], r) !== !1; r++)
      ;
}
function ct(t, e) {
  var r, n, i, o, u, a, h, c, M, d, S = 0, O = t.type === "FeatureCollection", P = t.type === "Feature", L = O ? t.features.length : 1;
  for (r = 0; r < L; r++) {
    for (a = O ? (
      // @ts-expect-error: Known type conflict
      t.features[r].geometry
    ) : P ? (
      // @ts-expect-error: Known type conflict
      t.geometry
    ) : t, c = O ? (
      // @ts-expect-error: Known type conflict
      t.features[r].properties
    ) : P ? (
      // @ts-expect-error: Known type conflict
      t.properties
    ) : {}, M = O ? (
      // @ts-expect-error: Known type conflict
      t.features[r].bbox
    ) : P ? (
      // @ts-expect-error: Known type conflict
      t.bbox
    ) : void 0, d = O ? (
      // @ts-expect-error: Known type conflict
      t.features[r].id
    ) : P ? (
      // @ts-expect-error: Known type conflict
      t.id
    ) : void 0, h = a ? a.type === "GeometryCollection" : !1, u = h ? a.geometries.length : 1, i = 0; i < u; i++) {
      if (o = h ? a.geometries[i] : a, o === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            S,
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
              S,
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
                S,
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
    S++;
  }
}
function mr(t, e) {
  ct(t, function(r, n, i, o, u) {
    var a = r === null ? null : r.type;
    switch (a) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            ge(r, i, { bbox: o, id: u }),
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
  if (ct(t, (i) => {
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
  return ft(t, (r) => {
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
  }), Ee(
    Object.keys(e).filter(function(r) {
      return e[r].coordinates.length;
    }).sort().map(function(r) {
      var n = { type: r, coordinates: e[r].coordinates }, i = { collectedProperties: e[r].properties };
      return ge(n, i);
    })
  );
}
function Ge(t) {
  if (!t) throw new Error("geojson is required");
  var e = [];
  return mr(t, function(r) {
    e.push(r);
  }), Ee(e);
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
      const o = e - 1 >> 1, u = r[o];
      if (n(i, u) >= 0) break;
      r[e] = u, e = o;
    }
    r[e] = i;
  }
  _down(e) {
    const { data: r, compare: n } = this, i = this.length >> 1, o = r[e];
    for (; e < i; ) {
      let u = (e << 1) + 1;
      const a = u + 1;
      if (a < this.length && n(r[a], r[u]) < 0 && (u = a), n(r[u], o) >= 0) break;
      r[e] = r[u], e = u;
    }
    r[e] = o;
  }
}
function br(t, e = 1, r = !1) {
  let n = 1 / 0, i = 1 / 0, o = -1 / 0, u = -1 / 0;
  for (const [A, m] of t[0])
    A < n && (n = A), m < i && (i = m), A > o && (o = A), m > u && (u = m);
  const a = o - n, h = u - i, c = Math.max(e, Math.min(a, h));
  if (c === e) {
    const A = [n, i];
    return A.distance = 0, A;
  }
  const M = new vr([], (A, m) => m.max - A.max);
  let d = Sr(t);
  const S = new $e(n + a / 2, i + h / 2, 0, t);
  S.d > d.d && (d = S);
  let O = 2;
  function P(A, m, F) {
    const R = new $e(A, m, F, t);
    O++, R.max > d.d + e && M.push(R), R.d > d.d && (d = R, r && console.log(\`found best \${Math.round(1e4 * R.d) / 1e4} after \${O} probes\`));
  }
  let L = c / 2;
  for (let A = n; A < o; A += c)
    for (let m = i; m < u; m += c)
      P(A + L, m + L, L);
  for (; M.length; ) {
    const { max: A, x: m, y: F, h: R } = M.pop();
    if (A - d.d <= e) break;
    L = R / 2, P(m - L, F - L, L), P(m + L, F - L, L), P(m - L, F + L, L), P(m + L, F + L, L);
  }
  r && console.log(\`num probes: \${O}
best distance: \${d.d}\`);
  const _ = [d.x, d.y];
  return _.distance = d.d, _;
}
function $e(t, e, r, n) {
  this.x = t, this.y = e, this.h = r, this.d = Er(t, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function Er(t, e, r) {
  let n = !1, i = 1 / 0;
  for (const o of r)
    for (let u = 0, a = o.length, h = a - 1; u < a; h = u++) {
      const c = o[u], M = o[h];
      c[1] > e != M[1] > e && t < (M[0] - c[0]) * (e - c[1]) / (M[1] - c[1]) + c[0] && (n = !n), i = Math.min(i, Pr(t, e, c, M));
    }
  return i === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(i);
}
function Sr(t) {
  let e = 0, r = 0, n = 0;
  const i = t[0];
  for (let u = 0, a = i.length, h = a - 1; u < a; h = u++) {
    const c = i[u], M = i[h], d = c[0] * M[1] - M[0] * c[1];
    r += (c[0] + M[0]) * d, n += (c[1] + M[1]) * d, e += d * 3;
  }
  const o = new $e(r / e, n / e, 0, t);
  return e === 0 || o.d < 0 ? new $e(i[0][0], i[0][1], 0, t) : o;
}
function Pr(t, e, r, n) {
  let i = r[0], o = r[1], u = n[0] - i, a = n[1] - o;
  if (u !== 0 || a !== 0) {
    const h = ((t - i) * u + (e - o) * a) / (u * u + a * a);
    h > 1 ? (i = n[0], o = n[1]) : h > 0 && (i += u * h, o += a * h);
  }
  return u = t - i, a = e - o, u * u + a * a;
}
function Mr(t) {
  const e = [];
  return t.type === "FeatureCollection" ? ft(t, function(r) {
    Ne(r, function(n) {
      e.push(Oe(n, r.properties));
    });
  }) : t.type === "Feature" ? Ne(t, function(r) {
    e.push(Oe(r, t.properties));
  }) : Ne(t, function(r) {
    e.push(Oe(r));
  }), Ee(e);
}
function Lr(t, e = {}) {
  if (t.bbox != null && e.recompute !== !0)
    return t.bbox;
  const r = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return Ne(t, (n) => {
    r[0] > n[0] && (r[0] = n[0]), r[1] > n[1] && (r[1] = n[1]), r[2] < n[0] && (r[2] = n[0]), r[3] < n[1] && (r[3] = n[1]);
  }), r;
}
function Ar(t, e = {}) {
  const r = Lr(t), n = (r[0] + r[2]) / 2, i = (r[1] + r[3]) / 2;
  return Oe([n, i], e.properties, e);
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
      return ht(t);
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
  }), e.properties = zt(t.properties), t.geometry == null ? e.geometry = null : e.geometry = ht(t.geometry), e;
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
function ht(t) {
  const e = { type: t.type };
  return t.bbox && (e.bbox = t.bbox), t.type === "GeometryCollection" ? (e.geometries = t.geometries.map((r) => ht(r)), e) : (e.coordinates = Kt(t.coordinates), e);
}
function Kt(t) {
  const e = t;
  return typeof e[0] != "object" ? e.slice() : e.map((r) => Kt(r));
}
function Xe(t) {
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
function Te(t) {
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
  var n = Xe(t), i = Xe(e), o = Ie(i[1] - n[1]), u = Ie(i[0] - n[0]), a = Ie(n[1]), h = Ie(i[1]), c = Math.pow(Math.sin(o / 2), 2) + Math.pow(Math.sin(u / 2), 2) * Math.cos(a) * Math.cos(h);
  return yr(
    2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c)),
    r.units
  );
}
var Cr = Object.defineProperty, Rr = Object.defineProperties, kr = Object.getOwnPropertyDescriptors, bt = Object.getOwnPropertySymbols, Fr = Object.prototype.hasOwnProperty, Br = Object.prototype.propertyIsEnumerable, Et = (t, e, r) => e in t ? Cr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, St = (t, e) => {
  for (var r in e || (e = {}))
    Fr.call(e, r) && Et(t, r, e[r]);
  if (bt)
    for (var r of bt(e))
      Br.call(e, r) && Et(t, r, e[r]);
  return t;
}, Pt = (t, e) => Rr(t, kr(e));
function Ir(t, e, r = {}) {
  if (!t) throw new Error("targetPoint is required");
  if (!e) throw new Error("points is required");
  let n = 1 / 0, i = 0;
  ft(e, (u, a) => {
    const h = Tr(t, u, r);
    h < n && (i = a, n = h);
  });
  const o = Dt(e.features[i]);
  return Pt(St({}, o), {
    properties: Pt(St({}, o.properties), {
      featureIndex: i,
      distanceToPoint: n
    })
  });
}
const he = 11102230246251565e-32, J = 134217729, Gr = (3 + 8 * he) * he;
function et(t, e, r, n, i) {
  let o, u, a, h, c = e[0], M = n[0], d = 0, S = 0;
  M > c == M > -c ? (o = c, c = e[++d]) : (o = M, M = n[++S]);
  let O = 0;
  if (d < t && S < r)
    for (M > c == M > -c ? (u = c + o, a = o - (u - c), c = e[++d]) : (u = M + o, a = o - (u - M), M = n[++S]), o = u, a !== 0 && (i[O++] = a); d < t && S < r; )
      M > c == M > -c ? (u = o + c, h = u - o, a = o - (u - h) + (c - h), c = e[++d]) : (u = o + M, h = u - o, a = o - (u - h) + (M - h), M = n[++S]), o = u, a !== 0 && (i[O++] = a);
  for (; d < t; )
    u = o + c, h = u - o, a = o - (u - h) + (c - h), c = e[++d], o = u, a !== 0 && (i[O++] = a);
  for (; S < r; )
    u = o + M, h = u - o, a = o - (u - h) + (M - h), M = n[++S], o = u, a !== 0 && (i[O++] = a);
  return (o !== 0 || O === 0) && (i[O++] = o), O;
}
function qr(t, e) {
  let r = e[0];
  for (let n = 1; n < t; n++) r += e[n];
  return r;
}
function Re(t) {
  return new Float64Array(t);
}
const Hr = (3 + 16 * he) * he, Dr = (2 + 12 * he) * he, Ur = (9 + 64 * he) * he * he, me = Re(4), Mt = Re(8), Lt = Re(12), At = Re(16), W = Re(4);
function zr(t, e, r, n, i, o, u) {
  let a, h, c, M, d, S, O, P, L, _, A, m, F, R, T, C, k, s;
  const l = t - i, f = r - i, w = e - o, p = n - o;
  R = l * p, S = J * l, O = S - (S - l), P = l - O, S = J * p, L = S - (S - p), _ = p - L, T = P * _ - (R - O * L - P * L - O * _), C = w * f, S = J * w, O = S - (S - w), P = w - O, S = J * f, L = S - (S - f), _ = f - L, k = P * _ - (C - O * L - P * L - O * _), A = T - k, d = T - A, me[0] = T - (A + d) + (d - k), m = R + A, d = m - R, F = R - (m - d) + (A - d), A = F - C, d = F - A, me[1] = F - (A + d) + (d - C), s = m + A, d = s - m, me[2] = m - (s - d) + (A - d), me[3] = s;
  let y = qr(4, me), v = Dr * u;
  if (y >= v || -y >= v || (d = t - l, a = t - (l + d) + (d - i), d = r - f, c = r - (f + d) + (d - i), d = e - w, h = e - (w + d) + (d - o), d = n - p, M = n - (p + d) + (d - o), a === 0 && h === 0 && c === 0 && M === 0) || (v = Ur * u + Gr * Math.abs(y), y += l * M + p * a - (w * c + f * h), y >= v || -y >= v)) return y;
  R = a * p, S = J * a, O = S - (S - a), P = a - O, S = J * p, L = S - (S - p), _ = p - L, T = P * _ - (R - O * L - P * L - O * _), C = h * f, S = J * h, O = S - (S - h), P = h - O, S = J * f, L = S - (S - f), _ = f - L, k = P * _ - (C - O * L - P * L - O * _), A = T - k, d = T - A, W[0] = T - (A + d) + (d - k), m = R + A, d = m - R, F = R - (m - d) + (A - d), A = F - C, d = F - A, W[1] = F - (A + d) + (d - C), s = m + A, d = s - m, W[2] = m - (s - d) + (A - d), W[3] = s;
  const g = et(4, me, 4, W, Mt);
  R = l * M, S = J * l, O = S - (S - l), P = l - O, S = J * M, L = S - (S - M), _ = M - L, T = P * _ - (R - O * L - P * L - O * _), C = w * c, S = J * w, O = S - (S - w), P = w - O, S = J * c, L = S - (S - c), _ = c - L, k = P * _ - (C - O * L - P * L - O * _), A = T - k, d = T - A, W[0] = T - (A + d) + (d - k), m = R + A, d = m - R, F = R - (m - d) + (A - d), A = F - C, d = F - A, W[1] = F - (A + d) + (d - C), s = m + A, d = s - m, W[2] = m - (s - d) + (A - d), W[3] = s;
  const x = et(g, Mt, 4, W, Lt);
  R = a * M, S = J * a, O = S - (S - a), P = a - O, S = J * M, L = S - (S - M), _ = M - L, T = P * _ - (R - O * L - P * L - O * _), C = h * c, S = J * h, O = S - (S - h), P = h - O, S = J * c, L = S - (S - c), _ = c - L, k = P * _ - (C - O * L - P * L - O * _), A = T - k, d = T - A, W[0] = T - (A + d) + (d - k), m = R + A, d = m - R, F = R - (m - d) + (A - d), A = F - C, d = F - A, W[1] = F - (A + d) + (d - C), s = m + A, d = s - m, W[2] = m - (s - d) + (A - d), W[3] = s;
  const E = et(x, Lt, 4, W, At);
  return At[E - 1];
}
function Kr(t, e, r, n, i, o) {
  const u = (e - o) * (r - i), a = (t - i) * (n - o), h = u - a, c = Math.abs(u + a);
  return Math.abs(h) >= Hr * c ? h : -zr(t, e, r, n, i, o, c);
}
function Vr(t, e) {
  var r, n, i = 0, o, u, a, h, c, M, d, S = t[0], O = t[1], P = e.length;
  for (r = 0; r < P; r++) {
    n = 0;
    var L = e[r], _ = L.length - 1;
    if (M = L[0], M[0] !== L[_][0] && M[1] !== L[_][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (u = M[0] - S, a = M[1] - O, n; n < _; n++) {
      if (d = L[n + 1], h = d[0] - S, c = d[1] - O, a === 0 && c === 0) {
        if (h <= 0 && u >= 0 || u <= 0 && h >= 0)
          return 0;
      } else if (c >= 0 && a <= 0 || c <= 0 && a >= 0) {
        if (o = Kr(u, h, a, c, 0, 0), o === 0)
          return 0;
        (o > 0 && c > 0 && a <= 0 || o < 0 && c <= 0 && a > 0) && i++;
      }
      M = d, a = c, u = h;
    }
  }
  return i % 2 !== 0;
}
function $r(t, e, r = {}) {
  if (!t)
    throw new Error("point is required");
  if (!e)
    throw new Error("polygon is required");
  const n = Xe(t), i = Or(e), o = i.type, u = e.bbox;
  let a = i.coordinates;
  if (u && Xr(n, u) === !1)
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
function _t(t) {
  const e = Yr(t), r = Ar(e);
  let n = !1, i = 0;
  for (; !n && i < e.features.length; ) {
    const o = e.features[i].geometry;
    let u, a, h, c, M, d, S = !1;
    if (o.type === "Point")
      r.geometry.coordinates[0] === o.coordinates[0] && r.geometry.coordinates[1] === o.coordinates[1] && (n = !0);
    else if (o.type === "MultiPoint") {
      let O = !1, P = 0;
      for (; !O && P < o.coordinates.length; )
        r.geometry.coordinates[0] === o.coordinates[P][0] && r.geometry.coordinates[1] === o.coordinates[P][1] && (n = !0, O = !0), P++;
    } else if (o.type === "LineString") {
      let O = 0;
      for (; !S && O < o.coordinates.length - 1; )
        u = r.geometry.coordinates[0], a = r.geometry.coordinates[1], h = o.coordinates[O][0], c = o.coordinates[O][1], M = o.coordinates[O + 1][0], d = o.coordinates[O + 1][1], Ot(u, a, h, c, M, d) && (S = !0, n = !0), O++;
    } else if (o.type === "MultiLineString") {
      let O = 0;
      for (; O < o.coordinates.length; ) {
        S = !1;
        let P = 0;
        const L = o.coordinates[O];
        for (; !S && P < L.length - 1; )
          u = r.geometry.coordinates[0], a = r.geometry.coordinates[1], h = L[P][0], c = L[P][1], M = L[P + 1][0], d = L[P + 1][1], Ot(u, a, h, c, M, d) && (S = !0, n = !0), P++;
        O++;
      }
    } else (o.type === "Polygon" || o.type === "MultiPolygon") && $r(r, o) && (n = !0);
    i++;
  }
  if (n)
    return r;
  {
    const o = Ee([]);
    for (let u = 0; u < e.features.length; u++)
      o.features = o.features.concat(
        Mr(e.features[u]).features
      );
    return Oe(Ir(r, o).geometry.coordinates);
  }
}
function Yr(t) {
  return t.type !== "FeatureCollection" ? t.type !== "Feature" ? Ee([ge(t)]) : Ee([t]) : t;
}
function Ot(t, e, r, n, i, o) {
  const u = Math.sqrt((i - r) * (i - r) + (o - n) * (o - n)), a = Math.sqrt((t - r) * (t - r) + (e - n) * (e - n)), h = Math.sqrt((i - t) * (i - t) + (o - e) * (o - e));
  return u === a + h;
}
function Nt(t, e, r = {}) {
  const n = Xe(t), i = Te(e);
  for (let o = 0; o < i.length - 1; o++) {
    let u = !1;
    if (r.ignoreEndVertices && (o === 0 && (u = "start"), o === i.length - 2 && (u = "end"), o === 0 && o + 1 === i.length - 1 && (u = "both")), Jr(
      i[o],
      i[o + 1],
      n,
      u,
      typeof r.epsilon > "u" ? null : r.epsilon
    ))
      return !0;
  }
  return !1;
}
function Jr(t, e, r, n, i) {
  const o = r[0], u = r[1], a = t[0], h = t[1], c = e[0], M = e[1], d = r[0] - a, S = r[1] - h, O = c - a, P = M - h, L = d * P - S * O;
  if (i !== null) {
    if (Math.abs(L) > i)
      return !1;
  } else if (L !== 0)
    return !1;
  if (Math.abs(O) === Math.abs(P) && Math.abs(O) === 0)
    return n ? !1 : r[0] === t[0] && r[1] === t[1];
  if (n) {
    if (n === "start")
      return Math.abs(O) >= Math.abs(P) ? O > 0 ? a < o && o <= c : c <= o && o < a : P > 0 ? h < u && u <= M : M <= u && u < h;
    if (n === "end")
      return Math.abs(O) >= Math.abs(P) ? O > 0 ? a <= o && o < c : c < o && o <= a : P > 0 ? h <= u && u < M : M < u && u <= h;
    if (n === "both")
      return Math.abs(O) >= Math.abs(P) ? O > 0 ? a < o && o < c : c < o && o < a : P > 0 ? h < u && u < M : M < u && u < h;
  } else return Math.abs(O) >= Math.abs(P) ? O > 0 ? a <= o && o <= c : c <= o && o <= a : P > 0 ? h <= u && u <= M : M <= u && u <= h;
  return !1;
}
function Zr(t, e = {}) {
  var r = typeof e == "object" ? e.mutate : e;
  if (!t) throw new Error("geojson is required");
  var n = Nr(t), i = [];
  switch (n) {
    case "LineString":
      i = tt(t, n);
      break;
    case "MultiLineString":
    case "Polygon":
      Te(t).forEach(function(u) {
        i.push(tt(u, n));
      });
      break;
    case "MultiPolygon":
      Te(t).forEach(function(u) {
        var a = [];
        u.forEach(function(h) {
          a.push(tt(h, n));
        }), i.push(a);
      });
      break;
    case "Point":
      return t;
    case "MultiPoint":
      var o = {};
      Te(t).forEach(function(u) {
        var a = u.join("-");
        Object.prototype.hasOwnProperty.call(o, a) || (i.push(u), o[a] = !0);
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
function tt(t, e) {
  const r = Te(t);
  if (r.length === 2 && !Tt(r[0], r[1])) return r;
  const n = [];
  let i = 0, o = 1, u = 2;
  for (n.push(r[i]); u < r.length; )
    Nt(r[o], xt([r[i], r[u]])) ? o = u : (n.push(r[o]), i = o, o++, u = o), u++;
  if (n.push(r[o]), e === "Polygon" || e === "MultiPolygon") {
    if (Nt(
      n[0],
      xt([n[1], n[n.length - 2]])
    ) && (n.shift(), n.pop(), n.push(n[0])), n.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!Tt(n[0], n[n.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return n;
}
function Tt(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}
function Wr(t, e) {
  var r = t[0] - e[0], n = t[1] - e[1];
  return r * r + n * n;
}
function Qr(t, e, r) {
  var n = e[0], i = e[1], o = r[0] - n, u = r[1] - i;
  if (o !== 0 || u !== 0) {
    var a = ((t[0] - n) * o + (t[1] - i) * u) / (o * o + u * u);
    a > 1 ? (n = r[0], i = r[1]) : a > 0 && (n += o * a, i += u * a);
  }
  return o = t[0] - n, u = t[1] - i, o * o + u * u;
}
function jr(t, e) {
  for (var r = t[0], n = [r], i, o = 1, u = t.length; o < u; o++)
    i = t[o], Wr(i, r) > e && (n.push(i), r = i);
  return r !== i && n.push(i), n;
}
function at(t, e, r, n, i) {
  for (var o = n, u, a = e + 1; a < r; a++) {
    var h = Qr(t[a], t[e], t[r]);
    h > o && (u = a, o = h);
  }
  o > n && (u - e > 1 && at(t, e, u, n, i), i.push(t[u]), r - u > 1 && at(t, u, r, n, i));
}
function en(t, e) {
  var r = t.length - 1, n = [t[0]];
  return at(t, 0, r, e, n), n.push(t[r]), n;
}
function Ye(t, e, r) {
  if (t.length <= 2) return t;
  var n = e !== void 0 ? e * e : 1;
  return t = r ? t : jr(t, n), t = en(t, n), t;
}
function Ct(t, e = {}) {
  var r, n, i;
  if (e = e ?? {}, !dr(e)) throw new Error("options is invalid");
  const o = (r = e.tolerance) != null ? r : 1, u = (n = e.highQuality) != null ? n : !1, a = (i = e.mutate) != null ? i : !1;
  if (!t) throw new Error("geojson is required");
  if (o && o < 0) throw new Error("invalid tolerance");
  return a !== !0 && (t = Dt(t)), ct(t, function(h) {
    tn(h, o, u);
  }), t;
}
function tn(t, e, r) {
  const n = t.type;
  if (n === "Point" || n === "MultiPoint") return t;
  if (Zr(t, { mutate: !0 }), n !== "GeometryCollection")
    switch (n) {
      case "LineString":
        t.coordinates = Ye(
          t.coordinates,
          e,
          r
        );
        break;
      case "MultiLineString":
        t.coordinates = t.coordinates.map(
          (i) => Ye(i, e, r)
        );
        break;
      case "Polygon":
        t.coordinates = Rt(
          t.coordinates,
          e,
          r
        );
        break;
      case "MultiPolygon":
        t.coordinates = t.coordinates.map(
          (i) => Rt(i, e, r)
        );
    }
  return t;
}
function Rt(t, e, r) {
  return t.map(function(n) {
    if (n.length < 4)
      throw new Error("invalid polygon");
    let i = e, o = Ye(n, i, r);
    for (; !kt(o) && i >= Number.EPSILON; )
      i -= i * 0.01, o = Ye(n, i, r);
    return kt(o) ? ((o[o.length - 1][0] !== o[0][0] || o[o.length - 1][1] !== o[0][1]) && o.push(o[0]), o) : n;
  });
}
function kt(t) {
  return t.length < 3 ? !1 : !(t.length === 3 && t[2][0] === t[0][0] && t[2][1] === t[0][1]);
}
class be {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  static _nextPow2(e) {
    return e <= 0 ? 0 : (e = e - 1 >>> 0, e |= e >> 1, e |= e >> 2, e |= e >> 4, e |= e >> 8, e |= e >> 16, e + 1 >>> 0);
  }
  rent(e) {
    if (!e || e <= 0) return be.ZERO_BUFFER;
    const r = be._nextPow2(e), n = this.map.get(r);
    return n && n.length ? n.pop() : new ArrayBuffer(r);
  }
  release(e) {
    if (!e || !e.byteLength) return;
    const r = be._nextPow2(e.byteLength);
    let n = this.map.get(r);
    n || (n = [], this.map.set(r, n)), n.push(e);
  }
}
be.ZERO_BUFFER = new ArrayBuffer(0);
const Ce = new TextEncoder(), Vt = new TextDecoder(), ve = { keys: [], index: /* @__PURE__ */ new Map() }, rn = 2e3;
function nn() {
  ve.keys = [], ve.index = /* @__PURE__ */ new Map();
}
let ue = !1;
function qe(t, e = {}) {
  const r = [], n = [], i = [], o = /* @__PURE__ */ new Map(), u = !!e.useSharedKeyTable;
  let a, h;
  u ? (a = ve.keys, h = ve.index) : (a = [], h = /* @__PURE__ */ new Map());
  let c = 0, M = 0;
  const d = (_) => {
    if (Array.isArray(_)) {
      const A = Number(_[0]), m = Number(_[1]);
      n.push(Number.isFinite(A) ? A : 0, Number.isFinite(m) ? m : 0);
    } else if (_ && (typeof _.x == "number" || typeof _.y == "number")) {
      const A = Number(_.x), m = Number(_.y);
      n.push(Number.isFinite(A) ? A : 0, Number.isFinite(m) ? m : 0);
    } else
      n.push(0, 0);
  };
  for (const _ of t) {
    const A = _.id == null ? "" : String(_.id), m = _.geometry || {}, F = m.type || "Unknown", R = { id: A, type: F, coordsOffset: c, coordsLength: 0 };
    if (F === "Point") {
      const k = m.coordinates || [];
      d(k), R.coordsLength = 2;
    } else if (F === "LineString" || F === "MultiPoint") {
      const k = m.coordinates || [];
      for (const s of k) d(s);
      R.coordsLength = (k.length || 0) * 2;
    } else if (F === "Polygon") {
      const k = m.coordinates || [];
      R.ringLengths = [];
      for (const s of k) {
        R.ringLengths.push(s.length || 0);
        for (const l of s) d(l);
      }
      R.coordsLength = R.ringLengths.reduce((s, l) => s + l, 0) * 2;
    } else if (F === "MultiPolygon") {
      const k = m.coordinates || [];
      R.polygonRingCounts = [], R.ringLengths = [];
      for (const s of k) {
        R.polygonRingCounts.push(s.length || 0);
        for (const l of s) {
          R.ringLengths.push(l.length || 0);
          for (const f of l) d(f);
        }
      }
      R.coordsLength = R.ringLengths.reduce((s, l) => s + l, 0) * 2;
    } else
      R.coordsLength = 0;
    const T = _.properties || {}, C = [];
    for (const k of Object.keys(T)) {
      let s = h.get(k);
      s === void 0 && (s = a.length, a.push(k), h.set(k, s), u && a.length > rn && (nn(), a = ve.keys, h = ve.index));
      const l = T[k];
      let f;
      if (l === null || typeof l == "string" || typeof l == "number" || typeof l == "boolean") {
        const w = typeof l + "|" + String(l);
        if (f = o.get(w), !f) {
          const p = JSON.stringify(l);
          f = Ce.encode(p), o.set(w, f);
        }
      } else {
        const w = JSON.stringify(l);
        f = Ce.encode(w);
      }
      i.push(f), C.push([s, M, f.length]), M += f.length;
    }
    R.props = C, c += R.coordsLength, r.push(R);
  }
  let S;
  if (e.propsBuffer)
    e.propsBuffer instanceof Uint8Array ? S = e.propsBuffer.subarray(0, M) : S = new Uint8Array(e.propsBuffer, 0, M), S.byteLength < M && (S = new Uint8Array(M));
  else if (e.pool && M > 0) {
    const _ = e.pool.rent(M);
    S = new Uint8Array(_, 0, M);
  } else
    S = new Uint8Array(M);
  let O = 0;
  for (const _ of i)
    S.set(_, O), O += _.length;
  const P = n.length;
  let L;
  if (e.coordsBuffer)
    e.coordsBuffer instanceof ArrayBuffer ? L = new Float32Array(e.coordsBuffer, 0, P) : e.coordsBuffer instanceof Float32Array ? L = e.coordsBuffer.subarray(0, P) : L = new Float32Array(P), L.length < P && (L = new Float32Array(P));
  else if (e.pool && P > 0) {
    const _ = e.pool.rent(P * 4);
    L = new Float32Array(_, 0, P);
  } else
    L = new Float32Array(P);
  return L.length > 0 && L.set(n), { meta: r, keys: a, propsBuffer: S, coordsArray: L };
}
function sn(t, e, r, n) {
  const i = r instanceof Float32Array ? r : new Float32Array(r), o = e instanceof Uint8Array ? e : e ? new Uint8Array(e) : new Uint8Array(0), u = [];
  for (let a = 0; a < (t.length || 0); a++) {
    const h = t[a] || {}, c = h.id, M = {};
    if (Array.isArray(h.props) && h.props.length && n && n.length)
      for (const _ of h.props) {
        const [A, m, F] = _;
        try {
          const R = o.subarray(m, m + F);
          M[n[A]] = JSON.parse(Vt.decode(R));
        } catch {
        }
      }
    const d = h.type || "Unknown";
    let S = h.coordsOffset || 0;
    const O = S + (h.coordsLength || 0);
    let P = null;
    if (d === "Point") {
      const _ = i[S], A = i[S + 1], m = Number.isFinite(_) ? Math.max(-180, Math.min(180, _)) : 0, F = Number.isFinite(A) ? Math.max(-90, Math.min(90, A)) : 0;
      if ((!Number.isFinite(_) || !Number.isFinite(A)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value", { index: a, id: c, rawX: _, rawY: A });
        } catch {
        }
      }
      P = { type: "Point", coordinates: [m, F] };
    } else if (d === "LineString" || d === "MultiPoint") {
      const _ = [];
      for (; S < O; S += 2) {
        const A = i[S], m = i[S + 1], F = Number.isFinite(A) ? Math.max(-180, Math.min(180, A)) : 0, R = Number.isFinite(m) ? Math.max(-90, Math.min(90, m)) : 0;
        if ((!Number.isFinite(A) || !Number.isFinite(m)) && !ue) {
          ue = !0;
          try {
            console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value", { index: a, id: c, rawX: A, rawY: m });
          } catch {
          }
        }
        _.push([F, R]);
      }
      P = { type: d, coordinates: _ };
    } else if (d === "Polygon") {
      const _ = [], A = h.ringLengths || [];
      for (const m of A) {
        const F = [];
        for (let R = 0; R < m; R++) {
          const T = i[S], C = i[S + 1], k = Number.isFinite(T) ? Math.max(-180, Math.min(180, T)) : 0, s = Number.isFinite(C) ? Math.max(-90, Math.min(90, C)) : 0;
          if ((!Number.isFinite(T) || !Number.isFinite(C)) && !ue) {
            ue = !0;
            try {
              console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value", { index: a, id: c, rawX: T, rawY: C });
            } catch {
            }
          }
          F.push([k, s]), S += 2;
        }
        _.push(F);
      }
      P = { type: "Polygon", coordinates: _ };
    } else if (d === "MultiPolygon") {
      const _ = [], A = h.polygonRingCounts || [], m = h.ringLengths || [];
      let F = 0;
      for (const R of A) {
        const T = [];
        for (let C = 0; C < R; C++) {
          const k = m[F++] || 0, s = [];
          for (let l = 0; l < k; l++) {
            const f = i[S], w = i[S + 1], p = Number.isFinite(f) ? Math.max(-180, Math.min(180, f)) : 0, y = Number.isFinite(w) ? Math.max(-90, Math.min(90, w)) : 0;
            if ((!Number.isFinite(f) || !Number.isFinite(w)) && !ue) {
              ue = !0;
              try {
                console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value", { index: a, id: c, rawX: f, rawY: w });
              } catch {
              }
            }
            s.push([p, y]), S += 2;
          }
          T.push(s);
        }
        _.push(T);
      }
      P = { type: "MultiPolygon", coordinates: _ };
    } else if (S < O) {
      const _ = i[S], A = i[S + 1], m = Number.isFinite(_) ? Math.max(-180, Math.min(180, _)) : 0, F = Number.isFinite(A) ? Math.max(-90, Math.min(90, A)) : 0;
      if ((!Number.isFinite(_) || !Number.isFinite(A)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value", { index: a, id: c, rawX: _, rawY: A });
        } catch {
        }
      }
      P = { type: "Point", coordinates: [m, F] };
    }
    P == null && (P = { type: "Point", coordinates: [0, 0] });
    const L = M && typeof M == "object" ? M : {};
    u.push({ type: "Feature", id: c, geometry: P, properties: L });
  }
  return u;
}
const Le = new be(), K = /* @__PURE__ */ new Map();
let rt = 1e4, we = null;
const on = (t, e) => {
  try {
    const r = t && t.geometry && t.geometry.coordinates;
    let n = br(r, e);
    return (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1])) && (n = _t(t).geometry.coordinates), {
      type: "Point",
      coordinates: [n[0], n[1]]
    };
  } catch {
    return console.log("Invalid feature geometry", t && t.id), _t(t).geometry;
  }
}, ln = new ArrayBuffer(8), nt = new DataView(ln), un = new ArrayBuffer(4), Ft = new DataView(un);
function $t() {
  return 2166136261;
}
function ie(t, e) {
  return t ^= e >>> 0, t = Math.imul(t, 16777619) >>> 0, t;
}
function an(t, e) {
  const r = Number(e) || 0;
  return nt.setFloat64(0, r, !0), t = ie(t, nt.getUint32(0, !0)), t = ie(t, nt.getUint32(4, !0)), t;
}
function oe(t, e) {
  const r = Number(e) || 0;
  return Ft.setFloat32(0, r, !0), t = ie(t, Ft.getUint32(0, !0)), t;
}
function Ue(t, e) {
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
  e = Ue(e, t.type || "");
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
        for (const u of o)
          e = oe(e, u && u[0]), e = oe(e, u && u[1]);
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
function fn(t, e) {
  return !t && !e ? !0 : !t || !e || t.type !== e.type ? !1 : Xt(t.coordinates, e.coordinates);
}
function cn(t) {
  let e = $t();
  e = ie(e, t.length || 0);
  for (const r of t) {
    if (e = Ue(e, r && r.id != null ? String(r.id) : ""), r && r.geometry) {
      const n = r.__inGeomHash !== void 0 ? r.__inGeomHash : xe(r.geometry);
      e = ie(e, n);
    }
    if (r && r.properties)
      for (const n of Object.keys(r.properties)) {
        e = Ue(e, n);
        const i = r.properties[n];
        i == null ? e = ie(e, 0) : typeof i == "number" ? e = an(e, i) : e = Ue(e, String(i));
      }
  }
  return e;
}
onmessage = (t) => {
  let e = t && t.data;
  if (e && e.type === "diff_ack") {
    try {
      if (we) {
        for (const P of we.addList || []) {
          const L = P && (P.feature || P);
          if (L && L.id != null)
            try {
              const _ = P && P.geomHash !== void 0 ? P.geomHash : xe(L.geometry), A = P && P.rawHash !== void 0 ? P.rawHash : _;
              K.set(String(L.id), { feature: L, geomHash: _, rawHash: A, ts: Date.now() });
            } catch {
              K.set(String(L.id), { feature: L, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const P of we.updateList || []) {
          const L = P && (P.feature || P);
          if (L && L.id != null)
            try {
              const _ = P && P.geomHash !== void 0 ? P.geomHash : xe(L.geometry), A = P && P.rawHash !== void 0 ? P.rawHash : _;
              K.set(String(L.id), { feature: L, geomHash: _, rawHash: A, ts: Date.now() });
            } catch {
              K.set(String(L.id), { feature: L, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const P of we.removeList || [])
          try {
            K.delete(String(P));
          } catch {
          }
        for (; K.size > rt; ) {
          const P = K.keys().next();
          if (P.done) break;
          K.delete(P.value);
        }
        we = null;
      }
    } catch {
    }
    return;
  }
  if (e && e.type === "request_full") {
    try {
      const P = Array.from(K.values()).map((F) => F.feature), { meta: L, keys: _, propsBuffer: A, coordsArray: m } = qe(P || [], { pool: Le, useSharedKeyTable: !0 });
      postMessage({ type: "geojson_bin", meta: L, keys: _, propsBuf: A.buffer, coords: m.buffer }, [A.buffer, m.buffer]);
    } catch {
    }
    return;
  }
  if (e && e.type === "features" && e.payload)
    try {
      const P = e.payload instanceof Uint8Array ? e.payload.buffer : e.payload, L = Vt.decode(P);
      e = JSON.parse(L);
    } catch {
      e = {};
    }
  if (e && e.type === "features_bin" && e.coords)
    try {
      const P = e.meta || [], L = e.propsBuf !== void 0 ? e.propsBuf : null, _ = e.coords, A = e.keys || [], m = sn(P, L, _, A), F = t.data && t.data.hashes ? t.data.hashes : null;
      if (F && Array.isArray(m))
        for (const R of m)
          try {
            const T = String(R && R.id != null ? R.id : ""), C = F[T];
            C !== void 0 && (R.__inGeomHash = C);
          } catch {
          }
      e = { features: m, tolerance: t.data && t.data.tolerance, promoteId: t.data && t.data.promoteId, _receivedPropsBuf: L, _receivedCoordsBuf: _, _receivedKeys: A, _receivedHashes: F, cacheSize: t.data && t.data.cacheSize };
    } catch {
      e = e || {};
    }
  const r = e || {}, n = r.features || [], i = r.tolerance || 1e-5, o = !0, u = /* @__PURE__ */ new Map();
  for (const P of n) {
    const L = P.id, _ = u.get(L) || [];
    _.push(P), u.set(L, _);
  }
  const a = { type: "FeatureCollection", features: [] }, h = [], c = [], M = /* @__PURE__ */ new Set(), d = [], S = /* @__PURE__ */ new Map();
  for (const [P, L] of u.entries()) {
    const _ = String(P), A = cn(L), m = K.get(_);
    if (m && m.rawHash === A) {
      d.push(m.feature);
      continue;
    }
    const { clipped: F, ...R } = L[0] && L[0].properties || {};
    let T;
    if (L.length === 1) {
      const s = L[0].geometry;
      let l = { type: "Feature", id: P, geometry: s, properties: R };
      s.type === "MultiPolygon" ? T = Ge(l) : T = { type: "FeatureCollection", features: [l] }, T = Ct(T, { tolerance: i, mutate: o });
    } else
      T = { type: "FeatureCollection", features: L.map((s) => ({ type: "Feature", id: P, geometry: s.geometry, properties: R })) }, T.features.some((s) => s.geometry.type === "MultiPolygon") && (T = Ge(T)), T = Ct(T, { tolerance: i, mutate: o }), L.some((s) => s.properties && s.properties.clipped) && (T = wr(T)), T.type === "Feature" ? T.geometry.type === "MultiPolygon" ? T = Ge(T) : T = { type: "FeatureCollection", features: [T] } : T.features.some((s) => s.geometry.type === "MultiPolygon") && (T = Ge(T));
    T.features = T.features.map((s) => (s.id = P, s.geometry.type === "Polygon" ? s.geometry = on(s, i) : console.log("Unexpected geometry type after union/simplify/flatten for id:" + P + " - type:" + s.geometry.type), s)), T = xr(T);
    const C = { type: "Feature", id: P, geometry: T.features[0].geometry, properties: R }, k = xe(C.geometry);
    if (!m)
      h.push(C);
    else if (k !== (m.geomHash || 0))
      try {
        fn(C.geometry, m.feature.geometry) || (c.push(C), M.add(_));
      } catch {
        c.push(C), M.add(_);
      }
    S.set(_, { feature: C, rawHash: A, geomHash: k }), d.push(C);
  }
  const O = r.promoteId;
  if (O)
    for (const P of d)
      P.properties || (P.properties = {}), P.id != null && (P.properties[O] === void 0 || P.properties[O] === null) && (P.properties[O] = P.id);
  try {
    e && typeof e.cacheSize == "number" && e.cacheSize > 0 && (rt = e.cacheSize);
    const P = d && d.length ? d : a.features || [];
    if (K.size === 0) {
      for (const [l, f] of S.entries())
        try {
          K.set(l, { feature: f.feature, geomHash: f.geomHash, rawHash: f.rawHash, ts: Date.now() });
        } catch {
          K.set(l, { feature: f.feature, geomHash: f.geomHash || 0, rawHash: f.rawHash || 0, ts: Date.now() });
        }
      const { meta: T, keys: C, propsBuffer: k, coordsArray: s } = qe(P || [], { pool: Le });
      postMessage({ type: "geojson_bin", meta: T, keys: C, propsBuf: k.buffer, coords: s.buffer }, [k.buffer, s.buffer]);
      return;
    }
    const L = h.length;
    let _ = Math.max(0, K.size + L - rt);
    const A = [];
    if (_ > 0) {
      for (const T of K.keys()) {
        if (A.length >= _) break;
        if (M.has(T)) continue;
        const C = K.get(T);
        A.push(C && C.feature && C.feature.id != null ? C.feature.id : T);
      }
      if (A.length < _)
        for (const T of K.keys()) {
          if (A.length >= _) break;
          if (A.includes(T)) continue;
          const C = K.get(T);
          A.push(C && C.feature && C.feature.id != null ? C.feature.id : T);
        }
    }
    if (h.length === 0 && c.length === 0 && A.length === 0)
      return;
    const m = c.map((T) => {
      const C = { id: T.id };
      T.geometry && (C.newGeometry = T.geometry);
      const k = K.get(String(T.id)), s = k && k.feature && k.feature.properties ? k.feature.properties : {}, l = T.properties || {}, f = Object.keys(s), w = Object.keys(l);
      if (w.length === 0 && f.length > 0)
        C.removeAllProperties = !0;
      else {
        const y = f.filter((v) => !(v in l));
        y.length && (C.removeProperties = y);
      }
      const p = w.filter((y) => l[y] !== s[y]).map((y) => ({ key: y, value: l[y] }));
      return p.length && (C.addOrUpdateProperties = p), C;
    }), F = h.map((T) => {
      const C = S.get(String(T.id));
      if (C) return { feature: C.feature, rawHash: C.rawHash, geomHash: C.geomHash };
      try {
        const k = xe(T.geometry);
        return { feature: T, rawHash: k, geomHash: k };
      } catch {
        return { feature: T, rawHash: 0, geomHash: 0 };
      }
    }), R = c.map((T) => {
      const C = S.get(String(T.id));
      if (C) return { feature: C.feature, rawHash: C.rawHash, geomHash: C.geomHash };
      try {
        const k = xe(T.geometry);
        return { feature: T, rawHash: k, geomHash: k };
      } catch {
        return { feature: T, rawHash: 0, geomHash: 0 };
      }
    });
    we = { addList: F, updateList: R, removeList: A };
    try {
      const T = { type: "geojson_diff_bin" };
      A.length && (K.size > 0 && A.length >= K.size ? T.removeAll = !0 : T.removeList = A);
      const C = [];
      if (h.length) {
        const { meta: k, keys: s, propsBuffer: l, coordsArray: f } = qe(h || [], { pool: Le, useSharedKeyTable: !0 });
        T.add = { meta: k, keys: s, propsBuf: l.buffer, coords: f.buffer }, l && l.buffer && C.push(l.buffer), f && f.buffer && C.push(f.buffer);
      }
      if (c.length) {
        const { meta: k, keys: s, propsBuffer: l, coordsArray: f } = qe(c || [], { pool: Le, useSharedKeyTable: !0 });
        T.update = { meta: k, keys: s, propsBuf: l.buffer, coords: f.buffer }, l && l.buffer && C.push(l.buffer), f && f.buffer && C.push(f.buffer);
      }
      if (m.length) {
        const k = [], s = /* @__PURE__ */ new Map(), l = [];
        let f = 0;
        const w = /* @__PURE__ */ new Map(), p = m.map((v) => {
          const g = { id: v.id };
          return v.removeAllProperties && (g.removeAllProperties = !0), Array.isArray(v.removeProperties) && v.removeProperties.length && (g.removeProperties = v.removeProperties.map((x) => {
            let E = s.get(x);
            return E === void 0 && (E = k.length, k.push(x), s.set(x, E)), E;
          })), Array.isArray(v.addOrUpdateProperties) && v.addOrUpdateProperties.length && (g.addOrUpdate = v.addOrUpdateProperties.map((x) => {
            const E = x.key;
            let b = s.get(E);
            b === void 0 && (b = k.length, k.push(E), s.set(E, b));
            const N = x.value;
            let B;
            if (N === null || typeof N == "string" || typeof N == "number" || typeof N == "boolean") {
              const U = typeof N + "|" + String(N);
              if (B = w.get(U), !B) {
                const $ = JSON.stringify(N);
                B = Ce.encode($), w.set(U, B);
              }
            } else {
              const U = JSON.stringify(N);
              B = Ce.encode(U);
            }
            l.push(B);
            const I = f, q = B.length;
            return f += q, [b, I, q];
          })), g;
        });
        let y = null;
        if (f > 0) {
          const v = Le.rent(f);
          y = new Uint8Array(v, 0, f);
          let g = 0;
          for (const x of l)
            y.set(x, g), g += x.length;
        } else
          y = new Uint8Array(0);
        T.updateDiffsMeta = p, T.updateKeys = k, y && y.buffer && y.byteLength && (T.updatePropsBuf = y.buffer, C.push(y.buffer));
      }
      postMessage(T, C);
      return;
    } catch {
      try {
        const C = {};
        A.length && (K.size > 0 && A.length >= K.size ? C.removeAll = !0 : C.remove = A), h.length && (C.add = h), m.length && (C.update = m), postMessage({ type: "geojson_diff", diff: C });
        return;
      } catch {
      }
    }
    return;
  } catch {
    try {
      const L = JSON.stringify(a), _ = Ce.encode(L);
      postMessage({ type: "geojson", payload: _.buffer }, [_.buffer]);
    } catch {
      postMessage(a);
    }
  }
};
`,Pn=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",Ln],{type:"text/javascript;charset=utf-8"});function fe(r){let n;try{if(n=Pn&&(self.URL||self.webkitURL).createObjectURL(Pn),!n)throw"";const e=new Worker(n,{type:"module",name:r?.name});return e.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(n)}),e}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(Ln),{type:"module",name:r?.name})}}class z{constructor(){this.map=new Map}static _nextPow2(n){return n<=0?0:(n=n-1>>>0,n|=n>>1,n|=n>>2,n|=n>>4,n|=n>>8,n|=n>>16,n+1>>>0)}rent(n){if(!n||n<=0)return z.ZERO_BUFFER;const e=z._nextPow2(n),s=this.map.get(e);return s&&s.length?s.pop():new ArrayBuffer(e)}release(n){if(!n||!n.byteLength)return;const e=z._nextPow2(n.byteLength);let s=this.map.get(e);s||(s=[],this.map.set(e,s)),s.push(n)}}z.ZERO_BUFFER=new ArrayBuffer(0);const ln=new TextEncoder,un=new TextDecoder,j={keys:[],index:new Map},ce=2e3;function pe(){j.keys=[],j.index=new Map}let C=!1;function de(r,n={}){const e=[],s=[],i=[],u=new Map,l=!!n.useSharedKeyTable;let c,p;l?(c=j.keys,p=j.index):(c=[],p=new Map);let y=0,g=0;const x=m=>{if(Array.isArray(m)){const S=Number(m[0]),F=Number(m[1]);s.push(Number.isFinite(S)?S:0,Number.isFinite(F)?F:0)}else if(m&&(typeof m.x=="number"||typeof m.y=="number")){const S=Number(m.x),F=Number(m.y);s.push(Number.isFinite(S)?S:0,Number.isFinite(F)?F:0)}else s.push(0,0)};for(const m of r){const S=m.id==null?"":String(m.id),F=m.geometry||{},_=F.type||"Unknown",w={id:S,type:_,coordsOffset:y,coordsLength:0};if(_==="Point"){const M=F.coordinates||[];x(M),w.coordsLength=2}else if(_==="LineString"||_==="MultiPoint"){const M=F.coordinates||[];for(const A of M)x(A);w.coordsLength=(M.length||0)*2}else if(_==="Polygon"){const M=F.coordinates||[];w.ringLengths=[];for(const A of M){w.ringLengths.push(A.length||0);for(const k of A)x(k)}w.coordsLength=w.ringLengths.reduce((A,k)=>A+k,0)*2}else if(_==="MultiPolygon"){const M=F.coordinates||[];w.polygonRingCounts=[],w.ringLengths=[];for(const A of M){w.polygonRingCounts.push(A.length||0);for(const k of A){w.ringLengths.push(k.length||0);for(const B of k)x(B)}}w.coordsLength=w.ringLengths.reduce((A,k)=>A+k,0)*2}else w.coordsLength=0;const L=m.properties||{},T=[];for(const M of Object.keys(L)){let A=p.get(M);A===void 0&&(A=c.length,c.push(M),p.set(M,A),l&&c.length>ce&&(pe(),c=j.keys,p=j.index));const k=L[M];let B;if(k===null||typeof k=="string"||typeof k=="number"||typeof k=="boolean"){const O=typeof k+"|"+String(k);if(B=u.get(O),!B){const t=JSON.stringify(k);B=ln.encode(t),u.set(O,B)}}else{const O=JSON.stringify(k);B=ln.encode(O)}i.push(B),T.push([A,g,B.length]),g+=B.length}w.props=T,y+=w.coordsLength,e.push(w)}let o;if(n.propsBuffer)n.propsBuffer instanceof Uint8Array?o=n.propsBuffer.subarray(0,g):o=new Uint8Array(n.propsBuffer,0,g),o.byteLength<g&&(o=new Uint8Array(g));else if(n.pool&&g>0){const m=n.pool.rent(g);o=new Uint8Array(m,0,g)}else o=new Uint8Array(g);let f=0;for(const m of i)o.set(m,f),f+=m.length;const d=s.length;let v;if(n.coordsBuffer)n.coordsBuffer instanceof ArrayBuffer?v=new Float32Array(n.coordsBuffer,0,d):n.coordsBuffer instanceof Float32Array?v=n.coordsBuffer.subarray(0,d):v=new Float32Array(d),v.length<d&&(v=new Float32Array(d));else if(n.pool&&d>0){const m=n.pool.rent(d*4);v=new Float32Array(m,0,d)}else v=new Float32Array(d);return v.length>0&&v.set(s),{meta:e,keys:c,propsBuffer:o,coordsArray:v}}function an(r,n,e,s){const i=e instanceof Float32Array?e:new Float32Array(e),u=n instanceof Uint8Array?n:n?new Uint8Array(n):new Uint8Array(0),l=[];for(let c=0;c<(r.length||0);c++){const p=r[c]||{},y=p.id,g={};if(Array.isArray(p.props)&&p.props.length&&s&&s.length)for(const m of p.props){const[S,F,_]=m;try{const w=u.subarray(F,F+_);g[s[S]]=JSON.parse(un.decode(w))}catch{}}const x=p.type||"Unknown";let o=p.coordsOffset||0;const f=o+(p.coordsLength||0);let d=null;if(x==="Point"){const m=i[o],S=i[o+1],F=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,_=Number.isFinite(S)?Math.max(-90,Math.min(90,S)):0;if((!Number.isFinite(m)||!Number.isFinite(S))&&!C){C=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value",{index:c,id:y,rawX:m,rawY:S})}catch{}}d={type:"Point",coordinates:[F,_]}}else if(x==="LineString"||x==="MultiPoint"){const m=[];for(;o<f;o+=2){const S=i[o],F=i[o+1],_=Number.isFinite(S)?Math.max(-180,Math.min(180,S)):0,w=Number.isFinite(F)?Math.max(-90,Math.min(90,F)):0;if((!Number.isFinite(S)||!Number.isFinite(F))&&!C){C=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value",{index:c,id:y,rawX:S,rawY:F})}catch{}}m.push([_,w])}d={type:x,coordinates:m}}else if(x==="Polygon"){const m=[],S=p.ringLengths||[];for(const F of S){const _=[];for(let w=0;w<F;w++){const L=i[o],T=i[o+1],M=Number.isFinite(L)?Math.max(-180,Math.min(180,L)):0,A=Number.isFinite(T)?Math.max(-90,Math.min(90,T)):0;if((!Number.isFinite(L)||!Number.isFinite(T))&&!C){C=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value",{index:c,id:y,rawX:L,rawY:T})}catch{}}_.push([M,A]),o+=2}m.push(_)}d={type:"Polygon",coordinates:m}}else if(x==="MultiPolygon"){const m=[],S=p.polygonRingCounts||[],F=p.ringLengths||[];let _=0;for(const w of S){const L=[];for(let T=0;T<w;T++){const M=F[_++]||0,A=[];for(let k=0;k<M;k++){const B=i[o],O=i[o+1],t=Number.isFinite(B)?Math.max(-180,Math.min(180,B)):0,a=Number.isFinite(O)?Math.max(-90,Math.min(90,O)):0;if((!Number.isFinite(B)||!Number.isFinite(O))&&!C){C=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value",{index:c,id:y,rawX:B,rawY:O})}catch{}}A.push([t,a]),o+=2}L.push(A)}m.push(L)}d={type:"MultiPolygon",coordinates:m}}else if(o<f){const m=i[o],S=i[o+1],F=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,_=Number.isFinite(S)?Math.max(-90,Math.min(90,S)):0;if((!Number.isFinite(m)||!Number.isFinite(S))&&!C){C=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value",{index:c,id:y,rawX:m,rawY:S})}catch{}}d={type:"Point",coordinates:[F,_]}}d==null&&(d={type:"Point",coordinates:[0,0]});const v=g&&typeof g=="object"?g:{};l.push({type:"Feature",id:y,geometry:d,properties:v})}return l}const ge=new ArrayBuffer(4),Fn=new DataView(ge);function ye(){return 2166136261}function D(r,n){return r^=n>>>0,r=Math.imul(r,16777619)>>>0,r}function R(r,n){const e=Number(n)||0;return Fn.setFloat32(0,e,!0),r=D(r,Fn.getUint32(0,!0)),r}function xe(r,n){if(!n)return r;for(let e=0;e<n.length;e++){const s=n.charCodeAt(e);r=D(r,s&65535)}return r}function Y(r){if(!r)return 0;let n=ye();n=xe(n,r.type||"");const e=r.type;if(e==="Point"){const s=r.coordinates||[];return n=R(n,s[0]),n=R(n,s[1]),n}if(e==="LineString"||e==="MultiPoint"){const s=r.coordinates||[];for(const i of s)n=R(n,i&&i[0]),n=R(n,i&&i[1]);return n}if(e==="Polygon"){const s=r.coordinates||[];n=D(n,s.length);for(const i of s){n=D(n,i.length||0);for(const u of i)n=R(n,u&&u[0]),n=R(n,u&&u[1])}return n}if(e==="MultiPolygon"){const s=r.coordinates||[];n=D(n,s.length);for(const i of s){n=D(n,i.length||0);for(const u of i){n=D(n,u.length||0);for(const l of u)n=R(n,l&&l[0]),n=R(n,l&&l[1])}}return n}try{const s=r.coordinates||[];for(const i of s)Array.isArray(i)?(n=R(n,i[0]),n=R(n,i[1])):n=R(n,i)}catch{}return n}class kn{constructor(n){return this.map=n.map,this.source=n.source instanceof maplibregl.VectorTileSource?n.source:this.map.getSource(n.source),this.sourceLayer=n.sourceLayer,this.fid=n.fid||"id",this.tiles=this.source.tiles.map(e=>e.split("{z}")[0]),this.tileSize=this.source.tileSize||512,this.tolerance=n.tolerance||1e-5,this.cacheSize=n.cacheSize||1e4,this.minion=new fe,this._abPool=new z,this._lastGeomHashes=new Map,this.minion.onmessage=e=>{const s=e&&e.data;if(s)if(s.type==="geojson_bin"&&s.coords)try{const i=s.coords instanceof Uint8Array?s.coords.buffer:s.coords,u=s.propsBuf!==void 0?s.propsBuf:null,l=an(s.meta||[],u,i,s.keys||[]);this.gjsource.setData({type:"FeatureCollection",features:l});try{for(const c of l)if(c&&c.id!=null)try{this._lastGeomHashes.set(String(c.id),Y(c.geometry))}catch{this._lastGeomHashes.set(String(c.id),0)}}catch{}try{u&&this._abPool.release(u instanceof ArrayBuffer?u:u.buffer)}catch{}try{i&&this._abPool.release(i instanceof ArrayBuffer?i:i.buffer)}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch(i){console.warn("Failed to decode binary worker response",i)}else if(s.type==="geojson_diff")try{const i=s&&s.diff?s.diff:{};if(this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(i);try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process geojson diff from worker",i)}else if(s.type==="geojson_diff_bin")try{const i=s.removeList||[],u=!!s.removeAll;let l=[];if(s.add&&s.add.coords)try{const o=s.add.propsBuf!==void 0?s.add.propsBuf:null,f=s.add.coords;l=an(s.add.meta||[],o,f,s.add.keys||[]);try{o&&this._abPool.release(o instanceof ArrayBuffer?o:o.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode add-list from worker",o);try{this.minion.postMessage({type:"request_full"})}catch{}return}let c=[];if(s.update&&s.update.coords)try{const o=s.update.propsBuf!==void 0?s.update.propsBuf:null,f=s.update.coords;c=an(s.update.meta||[],o,f,s.update.keys||[]);try{o&&this._abPool.release(o instanceof ArrayBuffer?o:o.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode update-list from worker",o);try{this.minion.postMessage({type:"request_full"})}catch{}return}let p=[];if(s.updateDiffs&&Array.isArray(s.updateDiffs))p=s.updateDiffs;else if(s.updateDiffsMeta&&Array.isArray(s.updateDiffsMeta))try{const o=s.updateKeys||[],f=s.updatePropsBuf!==void 0?s.updatePropsBuf:null,d=f?f instanceof Uint8Array?f:new Uint8Array(f):new Uint8Array(0),v=un;for(const m of s.updateDiffsMeta){const S={id:m.id};if(m.removeAllProperties&&(S.removeAllProperties=!0),Array.isArray(m.removeProperties)&&m.removeProperties.length&&(S.removeProperties=m.removeProperties.map(F=>o[F])),Array.isArray(m.addOrUpdate)&&m.addOrUpdate.length){const F=[];for(const _ of m.addOrUpdate){const[w,L,T]=_,M=o[w];try{const A=d.subarray(L,L+T),k=JSON.parse(v.decode(A));F.push({key:M,value:k})}catch{}}F.length&&(S.addOrUpdateProperties=F)}p.push(S)}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode compacted update diffs",o)}const y=new Map((c||[]).map(o=>[String(o.id),o])),g=p.map(o=>{const f={id:o.id},d=y.get(String(o.id));return d&&d.geometry&&(f.newGeometry=d.geometry),o.removeAllProperties&&(f.removeAllProperties=!0),o.removeProperties&&(f.removeProperties=o.removeProperties),o.addOrUpdateProperties&&(f.addOrUpdateProperties=o.addOrUpdateProperties),f}).filter(o=>o!=null),x={};if(u?x.removeAll=!0:i.length&&(x.remove=i),l.length&&(x.add=l),g.length&&(x.update=g),this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(x);try{if(l&&l.length){for(const o of l)if(o&&o.id!=null)try{this._lastGeomHashes.set(String(o.id),Y(o.geometry))}catch{this._lastGeomHashes.set(String(o.id),0)}}if(c&&c.length){for(const o of c)if(o&&o.id!=null)try{this._lastGeomHashes.set(String(o.id),Y(o.geometry))}catch{this._lastGeomHashes.set(String(o.id),0)}}if(i&&i.length)for(const o of i)this._lastGeomHashes.delete(String(o))}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process binary geojson diff from worker",i)}else if(s.type==="geojson"&&s.payload)try{const i=s.payload instanceof Uint8Array?s.payload.buffer:s.payload,u=un.decode(i),l=JSON.parse(u);this.gjsource.setData(l)}catch(i){console.warn("Failed to decode worker response",i)}else try{this.gjsource.setData(s)}catch(i){console.warn("Failed to set worker data",i)}},this.map.addSource(this.source.id+"-proper",{type:"geojson",maxzoom:this.source.maxzoom,promoteId:this.fid,data:{}}),this.gjsource=this.map.getSource(this.source.id+"-proper"),maplibregl.addProtocol("proper",this._protocol),this.map.setTransformRequest((e,s)=>this.tiles.some(u=>e.startsWith(u))&&s==="Tile"?{url:"proper://"+e}:{url:e}),this._pendingPost=null,this._postTimer=null,this._postDelay=n.postDelay||100,this.map.on("sourcedata",e=>{if(e.sourceId===this.source.id&&e.isSourceLoaded){const s=this.map.querySourceFeatures(this.source.id,{sourceLayer:this.sourceLayer}),i=e.tile.tileID.canonical.z,u=this.tolerance*Math.pow(10,-.301*i+5.19),l={features:s.map(c=>({id:c.id,geometry:c.geometry,properties:c.properties})),tolerance:u};this._pendingPost=l,this._postTimer==null&&(this._postTimer=setTimeout(()=>{try{if(this._pendingPost){const c=this._pendingPost.features||[],p=new Map;let y=!0;if(this._lastGeomHashes&&this._lastGeomHashes.size===c.length)for(const g of c){const x=String(g.id==null?"":g.id);let o=0;try{o=Y(g.geometry)}catch{o=0}if(p.set(x,o),this._lastGeomHashes.get(x)!==o){y=!1;break}}else y=!1;if(y){this._lastGeomHashes=p;return}try{const{meta:g,keys:x,propsBuffer:o,coordsArray:f}=de(this._pendingPost.features||[],{pool:this._abPool,useSharedKeyTable:!0}),d=Object.fromEntries(p);this.minion.postMessage({type:"features_bin",meta:g,keys:x,propsBuf:o.buffer,tolerance:this._pendingPost.tolerance,coords:f.buffer,cacheSize:this.cacheSize,promoteId:this.fid,hashes:d},[o.buffer,f.buffer]),this._lastGeomHashes=p}catch{try{const x=Object.assign({},this._pendingPost,{promoteId:this.fid}),o=JSON.stringify(x),f=ln.encode(o);this.minion.postMessage({type:"features",payload:f.buffer},[f.buffer])}catch{const o=Object.assign({},this._pendingPost,{promoteId:this.fid});this.minion.postMessage(o)}}}}finally{this._pendingPost=null,this._postTimer=null}},this._postDelay))}}),this.map.refreshTiles(this.source.id),this.gjsource}_protocol=async n=>{const s=n.url.replace("proper://",""),i=n.url.split(/\/|\./i);if(i===null||i.length<4)return console.warn(`Malformed URL: ${n.url}`),{data:null};const u=await fetch(s);let l;if(u.status===200){const c=i.length,[p,y,g]=i.slice(c-4,c-1).map(d=>d*1),x=await u.arrayBuffer(),o=new ee(new Nn(x)),f={layers:Object.entries(o.layers).reduce((d,[v,m])=>({...d,[v]:{...m,feature:S=>{const F=m.feature(S),w=F.loadGeometry().flat(1/0).some(L=>L.x>=m.extent-1||L.y>=m.extent-1||L.x<=1||L.y<=1);return F.properties.clipped=w,F}}}),{})};l=Sn(f).buffer}else l=Sn({}).buffer;return{data:l}}}maplibregl.VectorTileSource.prototype.ProperLabels=function(r){return this._proper||(this._proper=new kn({map:this._map,source:this})),this._proper};module.exports=kn;
