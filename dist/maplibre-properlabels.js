(function(W,U){typeof exports=="object"&&typeof module<"u"?module.exports=U():typeof define=="function"&&define.amd?define(U):(W=typeof globalThis<"u"?globalThis:W||self,W.ProperLabels=U())})(this,(function(){"use strict";const U=23283064365386963e-26,Nn=12,cn=typeof TextDecoder>"u"?null:new TextDecoder("utf-8"),nn=0,X=1,$=2,Y=5;class Bn{constructor(n=new Uint8Array(16)){this.buf=ArrayBuffer.isView(n)?n:new Uint8Array(n),this.dataView=new DataView(this.buf.buffer),this.pos=0,this.type=0,this.length=this.buf.length}readFields(n,e,s=this.length){for(;this.pos<s;){const i=this.readVarint(),u=i>>3,l=this.pos;this.type=i&7,n(u,e,this),this.pos===l&&this.skip(i)}return e}readMessage(n,e){return this.readFields(n,e,this.readVarint()+this.pos)}readFixed32(){const n=this.dataView.getUint32(this.pos,!0);return this.pos+=4,n}readSFixed32(){const n=this.dataView.getInt32(this.pos,!0);return this.pos+=4,n}readFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getUint32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readSFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getInt32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readFloat(){const n=this.dataView.getFloat32(this.pos,!0);return this.pos+=4,n}readDouble(){const n=this.dataView.getFloat64(this.pos,!0);return this.pos+=8,n}readVarint(n){const e=this.buf;let s,i;return i=e[this.pos++],s=i&127,i<128||(i=e[this.pos++],s|=(i&127)<<7,i<128)||(i=e[this.pos++],s|=(i&127)<<14,i<128)||(i=e[this.pos++],s|=(i&127)<<21,i<128)?s:(i=e[this.pos],s|=(i&15)<<28,On(s,n,this))}readVarint64(){return this.readVarint(!0)}readSVarint(){const n=this.readVarint();return n%2===1?(n+1)/-2:n/2}readBoolean(){return!!this.readVarint()}readString(){const n=this.readVarint()+this.pos,e=this.pos;return this.pos=n,n-e>=Nn&&cn?cn.decode(this.buf.subarray(e,n)):$n(this.buf,e,n)}readBytes(){const n=this.readVarint()+this.pos,e=this.buf.subarray(this.pos,n);return this.pos=n,e}readPackedVarint(n=[],e){const s=this.readPackedEnd();for(;this.pos<s;)n.push(this.readVarint(e));return n}readPackedSVarint(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSVarint());return n}readPackedBoolean(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readBoolean());return n}readPackedFloat(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFloat());return n}readPackedDouble(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readDouble());return n}readPackedFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed32());return n}readPackedSFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed32());return n}readPackedFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed64());return n}readPackedSFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed64());return n}readPackedEnd(){return this.type===$?this.readVarint()+this.pos:this.pos+1}skip(n){const e=n&7;if(e===nn)for(;this.buf[this.pos++]>127;);else if(e===$)this.pos=this.readVarint()+this.pos;else if(e===Y)this.pos+=4;else if(e===X)this.pos+=8;else throw new Error(`Unimplemented type: ${e}`)}writeTag(n,e){this.writeVarint(n<<3|e)}realloc(n){let e=this.length||16;for(;e<this.pos+n;)e*=2;if(e!==this.length){const s=new Uint8Array(e);s.set(this.buf),this.buf=s,this.dataView=new DataView(s.buffer),this.length=e}}finish(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)}writeFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeSFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*U),!0),this.pos+=8}writeSFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*U),!0),this.pos+=8}writeVarint(n){if(n=+n||0,n>268435455||n<0){Rn(n,this);return}this.realloc(4),this.buf[this.pos++]=n&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=n>>>7&127)))}writeSVarint(n){this.writeVarint(n<0?-n*2-1:n*2)}writeBoolean(n){this.writeVarint(+n)}writeString(n){n=String(n),this.realloc(n.length*4),this.pos++;const e=this.pos;this.pos=Jn(this.buf,n,this.pos);const s=this.pos-e;s>=128&&pn(e,s,this),this.pos=e-1,this.writeVarint(s),this.pos+=s}writeFloat(n){this.realloc(4),this.dataView.setFloat32(this.pos,n,!0),this.pos+=4}writeDouble(n){this.realloc(8),this.dataView.setFloat64(this.pos,n,!0),this.pos+=8}writeBytes(n){const e=n.length;this.writeVarint(e),this.realloc(e);for(let s=0;s<e;s++)this.buf[this.pos++]=n[s]}writeRawMessage(n,e){this.pos++;const s=this.pos;n(e,this);const i=this.pos-s;i>=128&&pn(s,i,this),this.pos=s-1,this.writeVarint(i),this.pos+=i}writeMessage(n,e,s){this.writeTag(n,$),this.writeRawMessage(e,s)}writePackedVarint(n,e){e.length&&this.writeMessage(n,In,e)}writePackedSVarint(n,e){e.length&&this.writeMessage(n,Gn,e)}writePackedBoolean(n,e){e.length&&this.writeMessage(n,qn,e)}writePackedFloat(n,e){e.length&&this.writeMessage(n,Dn,e)}writePackedDouble(n,e){e.length&&this.writeMessage(n,Un,e)}writePackedFixed32(n,e){e.length&&this.writeMessage(n,Hn,e)}writePackedSFixed32(n,e){e.length&&this.writeMessage(n,jn,e)}writePackedFixed64(n,e){e.length&&this.writeMessage(n,zn,e)}writePackedSFixed64(n,e){e.length&&this.writeMessage(n,Kn,e)}writeBytesField(n,e){this.writeTag(n,$),this.writeBytes(e)}writeFixed32Field(n,e){this.writeTag(n,Y),this.writeFixed32(e)}writeSFixed32Field(n,e){this.writeTag(n,Y),this.writeSFixed32(e)}writeFixed64Field(n,e){this.writeTag(n,X),this.writeFixed64(e)}writeSFixed64Field(n,e){this.writeTag(n,X),this.writeSFixed64(e)}writeVarintField(n,e){this.writeTag(n,nn),this.writeVarint(e)}writeSVarintField(n,e){this.writeTag(n,nn),this.writeSVarint(e)}writeStringField(n,e){this.writeTag(n,$),this.writeString(e)}writeFloatField(n,e){this.writeTag(n,Y),this.writeFloat(e)}writeDoubleField(n,e){this.writeTag(n,X),this.writeDouble(e)}writeBooleanField(n,e){this.writeVarintField(n,+e)}}function On(r,n,e){const s=e.buf;let i,u;if(u=s[e.pos++],i=(u&112)>>4,u<128||(u=s[e.pos++],i|=(u&127)<<3,u<128)||(u=s[e.pos++],i|=(u&127)<<10,u<128)||(u=s[e.pos++],i|=(u&127)<<17,u<128)||(u=s[e.pos++],i|=(u&127)<<24,u<128)||(u=s[e.pos++],i|=(u&1)<<31,u<128))return q(r,i,n);throw new Error("Expected varint not more than 10 bytes")}function q(r,n,e){return e?n*4294967296+(r>>>0):(n>>>0)*4294967296+(r>>>0)}function Rn(r,n){let e,s;if(r>=0?(e=r%4294967296|0,s=r/4294967296|0):(e=~(-r%4294967296),s=~(-r/4294967296),e^4294967295?e=e+1|0:(e=0,s=s+1|0)),r>=18446744073709552e3||r<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");n.realloc(10),Vn(e,s,n),Cn(s,n)}function Vn(r,n,e){e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos]=r&127}function Cn(r,n){const e=(r&7)<<4;n.buf[n.pos++]|=e|((r>>>=3)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127)))))}function pn(r,n,e){const s=n<=16383?1:n<=2097151?2:n<=268435455?3:Math.floor(Math.log(n)/(Math.LN2*7));e.realloc(s);for(let i=e.pos-1;i>=r;i--)e.buf[i+s]=e.buf[i]}function In(r,n){for(let e=0;e<r.length;e++)n.writeVarint(r[e])}function Gn(r,n){for(let e=0;e<r.length;e++)n.writeSVarint(r[e])}function Dn(r,n){for(let e=0;e<r.length;e++)n.writeFloat(r[e])}function Un(r,n){for(let e=0;e<r.length;e++)n.writeDouble(r[e])}function qn(r,n){for(let e=0;e<r.length;e++)n.writeBoolean(r[e])}function Hn(r,n){for(let e=0;e<r.length;e++)n.writeFixed32(r[e])}function jn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed32(r[e])}function zn(r,n){for(let e=0;e<r.length;e++)n.writeFixed64(r[e])}function Kn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed64(r[e])}function $n(r,n,e){let s="",i=n;for(;i<e;){const u=r[i];let l=null,c=u>239?4:u>223?3:u>191?2:1;if(i+c>e)break;let p,m,g;c===1?u<128&&(l=u):c===2?(p=r[i+1],(p&192)===128&&(l=(u&31)<<6|p&63,l<=127&&(l=null))):c===3?(p=r[i+1],m=r[i+2],(p&192)===128&&(m&192)===128&&(l=(u&15)<<12|(p&63)<<6|m&63,(l<=2047||l>=55296&&l<=57343)&&(l=null))):c===4&&(p=r[i+1],m=r[i+2],g=r[i+3],(p&192)===128&&(m&192)===128&&(g&192)===128&&(l=(u&15)<<18|(p&63)<<12|(m&63)<<6|g&63,(l<=65535||l>=1114112)&&(l=null))),l===null?(l=65533,c=1):l>65535&&(l-=65536,s+=String.fromCharCode(l>>>10&1023|55296),l=56320|l&1023),s+=String.fromCharCode(l),i+=c}return s}function Jn(r,n,e){for(let s=0,i,u;s<n.length;s++){if(i=n.charCodeAt(s),i>55295&&i<57344)if(u)if(i<56320){r[e++]=239,r[e++]=191,r[e++]=189,u=i;continue}else i=u-55296<<10|i-56320|65536,u=null;else{i>56319||s+1===n.length?(r[e++]=239,r[e++]=191,r[e++]=189):u=i;continue}else u&&(r[e++]=239,r[e++]=191,r[e++]=189,u=null);i<128?r[e++]=i:(i<2048?r[e++]=i>>6|192:(i<65536?r[e++]=i>>12|224:(r[e++]=i>>18|240,r[e++]=i>>12&63|128),r[e++]=i>>6&63|128),r[e++]=i&63|128)}return e}function I(r,n){this.x=r,this.y=n}I.prototype={clone(){return new I(this.x,this.y)},add(r){return this.clone()._add(r)},sub(r){return this.clone()._sub(r)},multByPoint(r){return this.clone()._multByPoint(r)},divByPoint(r){return this.clone()._divByPoint(r)},mult(r){return this.clone()._mult(r)},div(r){return this.clone()._div(r)},rotate(r){return this.clone()._rotate(r)},rotateAround(r,n){return this.clone()._rotateAround(r,n)},matMult(r){return this.clone()._matMult(r)},unit(){return this.clone()._unit()},perp(){return this.clone()._perp()},round(){return this.clone()._round()},mag(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals(r){return this.x===r.x&&this.y===r.y},dist(r){return Math.sqrt(this.distSqr(r))},distSqr(r){const n=r.x-this.x,e=r.y-this.y;return n*n+e*e},angle(){return Math.atan2(this.y,this.x)},angleTo(r){return Math.atan2(this.y-r.y,this.x-r.x)},angleWith(r){return this.angleWithSep(r.x,r.y)},angleWithSep(r,n){return Math.atan2(this.x*n-this.y*r,this.x*r+this.y*n)},_matMult(r){const n=r[0]*this.x+r[1]*this.y,e=r[2]*this.x+r[3]*this.y;return this.x=n,this.y=e,this},_add(r){return this.x+=r.x,this.y+=r.y,this},_sub(r){return this.x-=r.x,this.y-=r.y,this},_mult(r){return this.x*=r,this.y*=r,this},_div(r){return this.x/=r,this.y/=r,this},_multByPoint(r){return this.x*=r.x,this.y*=r.y,this},_divByPoint(r){return this.x/=r.x,this.y/=r.y,this},_unit(){return this._div(this.mag()),this},_perp(){const r=this.y;return this.y=this.x,this.x=-r,this},_rotate(r){const n=Math.cos(r),e=Math.sin(r),s=n*this.x-e*this.y,i=e*this.x+n*this.y;return this.x=s,this.y=i,this},_rotateAround(r,n){const e=Math.cos(r),s=Math.sin(r),i=n.x+e*(this.x-n.x)-s*(this.y-n.y),u=n.y+s*(this.x-n.x)+e*(this.y-n.y);return this.x=i,this.y=u,this},_round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},constructor:I},I.convert=function(r){if(r instanceof I)return r;if(Array.isArray(r))return new I(+r[0],+r[1]);if(r.x!==void 0&&r.y!==void 0)return new I(+r.x,+r.y);throw new Error("Expected [x, y] or {x, y} point format")};class dn{constructor(n,e,s,i,u){this.properties={},this.extent=s,this.type=0,this.id=void 0,this._pbf=n,this._geometry=-1,this._keys=i,this._values=u,n.readFields(Wn,this,e)}loadGeometry(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos,s=[];let i,u=1,l=0,c=0,p=0;for(;n.pos<e;){if(l<=0){const m=n.readVarint();u=m&7,l=m>>3}if(l--,u===1||u===2)c+=n.readSVarint(),p+=n.readSVarint(),u===1&&(i&&s.push(i),i=[]),i&&i.push(new I(c,p));else if(u===7)i&&i.push(i[0].clone());else throw new Error(`unknown command ${u}`)}return i&&s.push(i),s}bbox(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos;let s=1,i=0,u=0,l=0,c=1/0,p=-1/0,m=1/0,g=-1/0;for(;n.pos<e;){if(i<=0){const y=n.readVarint();s=y&7,i=y>>3}if(i--,s===1||s===2)u+=n.readSVarint(),l+=n.readSVarint(),u<c&&(c=u),u>p&&(p=u),l<m&&(m=l),l>g&&(g=l);else if(s!==7)throw new Error(`unknown command ${s}`)}return[c,m,p,g]}toGeoJSON(n,e,s){const i=this.extent*Math.pow(2,s),u=this.extent*n,l=this.extent*e,c=this.loadGeometry();function p(o){return[(o.x+u)*360/i-180,360/Math.PI*Math.atan(Math.exp((1-(o.y+l)*2/i)*Math.PI))-90]}function m(o){return o.map(p)}let g;if(this.type===1){const o=[];for(const d of c)o.push(d[0]);const f=m(o);g=o.length===1?{type:"Point",coordinates:f[0]}:{type:"MultiPoint",coordinates:f}}else if(this.type===2){const o=c.map(m);g=o.length===1?{type:"LineString",coordinates:o[0]}:{type:"MultiLineString",coordinates:o}}else if(this.type===3){const o=Yn(c),f=[];for(const d of o)f.push(d.map(m));g=f.length===1?{type:"Polygon",coordinates:f[0]}:{type:"MultiPolygon",coordinates:f}}else throw new Error("unknown feature type");const y={type:"Feature",geometry:g,properties:this.properties};return this.id!=null&&(y.id=this.id),y}}dn.types=["Unknown","Point","LineString","Polygon"];function Wn(r,n,e){r===1?n.id=e.readVarint():r===2?Xn(e,n):r===3?n.type=e.readVarint():r===4&&(n._geometry=e.pos)}function Xn(r,n){const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=n._keys[r.readVarint()],i=n._values[r.readVarint()];n.properties[s]=i}}function Yn(r){const n=r.length;if(n<=1)return[r];const e=[];let s,i;for(let u=0;u<n;u++){const l=Zn(r[u]);l!==0&&(i===void 0&&(i=l<0),i===l<0?(s&&e.push(s),s=[r[u]]):s&&s.push(r[u]))}return s&&e.push(s),e}function Zn(r){let n=0;for(let e=0,s=r.length,i=s-1,u,l;e<s;i=e++)u=r[e],l=r[i],n+=(l.x-u.x)*(u.y+l.y);return n}class Qn{constructor(n,e){this.version=1,this.name="",this.extent=4096,this.length=0,this._pbf=n,this._keys=[],this._values=[],this._features=[],n.readFields(ne,this,e),this.length=this._features.length}feature(n){if(n<0||n>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[n];const e=this._pbf.readVarint()+this._pbf.pos;return new dn(this._pbf,e,this.extent,this._keys,this._values)}}function ne(r,n,e){r===15?n.version=e.readVarint():r===1?n.name=e.readString():r===5?n.extent=e.readVarint():r===2?n._features.push(e.pos):r===3?n._keys.push(e.readString()):r===4&&n._values.push(ee(e))}function ee(r){let n=null;const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=r.readVarint()>>3;n=s===1?r.readString():s===2?r.readFloat():s===3?r.readDouble():s===4?r.readVarint64():s===5?r.readVarint():s===6?r.readSVarint():s===7?r.readBoolean():null}if(n==null)throw new Error("unknown feature value");return n}class te{constructor(n,e){this.layers=n.readFields(re,{},e)}}function re(r,n,e){if(r===3){const s=new Qn(e,e.readVarint()+e.pos);s.length&&(n[s.name]=s)}}function ie(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var H={exports:{}},Z={};var gn;function se(){return gn||(gn=1,Z.read=function(r,n,e,s,i){var u,l,c=i*8-s-1,p=(1<<c)-1,m=p>>1,g=-7,y=e?i-1:0,o=e?-1:1,f=r[n+y];for(y+=o,u=f&(1<<-g)-1,f>>=-g,g+=c;g>0;u=u*256+r[n+y],y+=o,g-=8);for(l=u&(1<<-g)-1,u>>=-g,g+=s;g>0;l=l*256+r[n+y],y+=o,g-=8);if(u===0)u=1-m;else{if(u===p)return l?NaN:(f?-1:1)*(1/0);l=l+Math.pow(2,s),u=u-m}return(f?-1:1)*l*Math.pow(2,u-s)},Z.write=function(r,n,e,s,i,u){var l,c,p,m=u*8-i-1,g=(1<<m)-1,y=g>>1,o=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,f=s?0:u-1,d=s?1:-1,v=n<0||n===0&&1/n<0?1:0;for(n=Math.abs(n),isNaN(n)||n===1/0?(c=isNaN(n)?1:0,l=g):(l=Math.floor(Math.log(n)/Math.LN2),n*(p=Math.pow(2,-l))<1&&(l--,p*=2),l+y>=1?n+=o/p:n+=o*Math.pow(2,1-y),n*p>=2&&(l++,p/=2),l+y>=g?(c=0,l=g):l+y>=1?(c=(n*p-1)*Math.pow(2,i),l=l+y):(c=n*Math.pow(2,y-1)*Math.pow(2,i),l=0));i>=8;r[e+f]=c&255,f+=d,c/=256,i-=8);for(l=l<<i|c,m+=i;m>0;r[e+f]=l&255,f+=d,l/=256,m-=8);r[e+f-d]|=v*128}),Z}var en,yn;function oe(){if(yn)return en;yn=1,en=n;var r=se();function n(t){this.buf=ArrayBuffer.isView&&ArrayBuffer.isView(t)?t:new Uint8Array(t||0),this.pos=0,this.type=0,this.length=this.buf.length}n.Varint=0,n.Fixed64=1,n.Bytes=2,n.Fixed32=5;var e=65536*65536,s=1/e,i=12,u=typeof TextDecoder>"u"?null:new TextDecoder("utf-8");n.prototype={destroy:function(){this.buf=null},readFields:function(t,a,h){for(h=h||this.length;this.pos<h;){var P=this.readVarint(),b=P>>3,E=this.pos;this.type=P&7,t(b,a,this),this.pos===E&&this.skip(P)}return a},readMessage:function(t,a){return this.readFields(t,a,this.readVarint()+this.pos)},readFixed32:function(){var t=T(this.buf,this.pos);return this.pos+=4,t},readSFixed32:function(){var t=A(this.buf,this.pos);return this.pos+=4,t},readFixed64:function(){var t=T(this.buf,this.pos)+T(this.buf,this.pos+4)*e;return this.pos+=8,t},readSFixed64:function(){var t=T(this.buf,this.pos)+A(this.buf,this.pos+4)*e;return this.pos+=8,t},readFloat:function(){var t=r.read(this.buf,this.pos,!0,23,4);return this.pos+=4,t},readDouble:function(){var t=r.read(this.buf,this.pos,!0,52,8);return this.pos+=8,t},readVarint:function(t){var a=this.buf,h,P;return P=a[this.pos++],h=P&127,P<128||(P=a[this.pos++],h|=(P&127)<<7,P<128)||(P=a[this.pos++],h|=(P&127)<<14,P<128)||(P=a[this.pos++],h|=(P&127)<<21,P<128)?h:(P=a[this.pos],h|=(P&15)<<28,l(h,t,this))},readVarint64:function(){return this.readVarint(!0)},readSVarint:function(){var t=this.readVarint();return t%2===1?(t+1)/-2:t/2},readBoolean:function(){return!!this.readVarint()},readString:function(){var t=this.readVarint()+this.pos,a=this.pos;return this.pos=t,t-a>=i&&u?B(this.buf,a,t):k(this.buf,a,t)},readBytes:function(){var t=this.readVarint()+this.pos,a=this.buf.subarray(this.pos,t);return this.pos=t,a},readPackedVarint:function(t,a){if(this.type!==n.Bytes)return t.push(this.readVarint(a));var h=c(this);for(t=t||[];this.pos<h;)t.push(this.readVarint(a));return t},readPackedSVarint:function(t){if(this.type!==n.Bytes)return t.push(this.readSVarint());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSVarint());return t},readPackedBoolean:function(t){if(this.type!==n.Bytes)return t.push(this.readBoolean());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readBoolean());return t},readPackedFloat:function(t){if(this.type!==n.Bytes)return t.push(this.readFloat());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFloat());return t},readPackedDouble:function(t){if(this.type!==n.Bytes)return t.push(this.readDouble());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readDouble());return t},readPackedFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed32());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFixed32());return t},readPackedSFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed32());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSFixed32());return t},readPackedFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed64());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readFixed64());return t},readPackedSFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed64());var a=c(this);for(t=t||[];this.pos<a;)t.push(this.readSFixed64());return t},skip:function(t){var a=t&7;if(a===n.Varint)for(;this.buf[this.pos++]>127;);else if(a===n.Bytes)this.pos=this.readVarint()+this.pos;else if(a===n.Fixed32)this.pos+=4;else if(a===n.Fixed64)this.pos+=8;else throw new Error("Unimplemented type: "+a)},writeTag:function(t,a){this.writeVarint(t<<3|a)},realloc:function(t){for(var a=this.length||16;a<this.pos+t;)a*=2;if(a!==this.length){var h=new Uint8Array(a);h.set(this.buf),this.buf=h,this.length=a}},finish:function(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)},writeFixed32:function(t){this.realloc(4),M(this.buf,t,this.pos),this.pos+=4},writeSFixed32:function(t){this.realloc(4),M(this.buf,t,this.pos),this.pos+=4},writeFixed64:function(t){this.realloc(8),M(this.buf,t&-1,this.pos),M(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeSFixed64:function(t){this.realloc(8),M(this.buf,t&-1,this.pos),M(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeVarint:function(t){if(t=+t||0,t>268435455||t<0){m(t,this);return}this.realloc(4),this.buf[this.pos++]=t&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=t>>>7&127)))},writeSVarint:function(t){this.writeVarint(t<0?-t*2-1:t*2)},writeBoolean:function(t){this.writeVarint(!!t)},writeString:function(t){t=String(t),this.realloc(t.length*4),this.pos++;var a=this.pos;this.pos=R(this.buf,t,this.pos);var h=this.pos-a;h>=128&&o(a,h,this),this.pos=a-1,this.writeVarint(h),this.pos+=h},writeFloat:function(t){this.realloc(4),r.write(this.buf,t,this.pos,!0,23,4),this.pos+=4},writeDouble:function(t){this.realloc(8),r.write(this.buf,t,this.pos,!0,52,8),this.pos+=8},writeBytes:function(t){var a=t.length;this.writeVarint(a),this.realloc(a);for(var h=0;h<a;h++)this.buf[this.pos++]=t[h]},writeRawMessage:function(t,a){this.pos++;var h=this.pos;t(a,this);var P=this.pos-h;P>=128&&o(h,P,this),this.pos=h-1,this.writeVarint(P),this.pos+=P},writeMessage:function(t,a,h){this.writeTag(t,n.Bytes),this.writeRawMessage(a,h)},writePackedVarint:function(t,a){a.length&&this.writeMessage(t,f,a)},writePackedSVarint:function(t,a){a.length&&this.writeMessage(t,d,a)},writePackedBoolean:function(t,a){a.length&&this.writeMessage(t,S,a)},writePackedFloat:function(t,a){a.length&&this.writeMessage(t,v,a)},writePackedDouble:function(t,a){a.length&&this.writeMessage(t,x,a)},writePackedFixed32:function(t,a){a.length&&this.writeMessage(t,_,a)},writePackedSFixed32:function(t,a){a.length&&this.writeMessage(t,F,a)},writePackedFixed64:function(t,a){a.length&&this.writeMessage(t,w,a)},writePackedSFixed64:function(t,a){a.length&&this.writeMessage(t,L,a)},writeBytesField:function(t,a){this.writeTag(t,n.Bytes),this.writeBytes(a)},writeFixed32Field:function(t,a){this.writeTag(t,n.Fixed32),this.writeFixed32(a)},writeSFixed32Field:function(t,a){this.writeTag(t,n.Fixed32),this.writeSFixed32(a)},writeFixed64Field:function(t,a){this.writeTag(t,n.Fixed64),this.writeFixed64(a)},writeSFixed64Field:function(t,a){this.writeTag(t,n.Fixed64),this.writeSFixed64(a)},writeVarintField:function(t,a){this.writeTag(t,n.Varint),this.writeVarint(a)},writeSVarintField:function(t,a){this.writeTag(t,n.Varint),this.writeSVarint(a)},writeStringField:function(t,a){this.writeTag(t,n.Bytes),this.writeString(a)},writeFloatField:function(t,a){this.writeTag(t,n.Fixed32),this.writeFloat(a)},writeDoubleField:function(t,a){this.writeTag(t,n.Fixed64),this.writeDouble(a)},writeBooleanField:function(t,a){this.writeVarintField(t,!!a)}};function l(t,a,h){var P=h.buf,b,E;if(E=P[h.pos++],b=(E&112)>>4,E<128||(E=P[h.pos++],b|=(E&127)<<3,E<128)||(E=P[h.pos++],b|=(E&127)<<10,E<128)||(E=P[h.pos++],b|=(E&127)<<17,E<128)||(E=P[h.pos++],b|=(E&127)<<24,E<128)||(E=P[h.pos++],b|=(E&1)<<31,E<128))return p(t,b,a);throw new Error("Expected varint not more than 10 bytes")}function c(t){return t.type===n.Bytes?t.readVarint()+t.pos:t.pos+1}function p(t,a,h){return h?a*4294967296+(t>>>0):(a>>>0)*4294967296+(t>>>0)}function m(t,a){var h,P;if(t>=0?(h=t%4294967296|0,P=t/4294967296|0):(h=~(-t%4294967296),P=~(-t/4294967296),h^4294967295?h=h+1|0:(h=0,P=P+1|0)),t>=18446744073709552e3||t<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");a.realloc(10),g(h,P,a),y(P,a)}function g(t,a,h){h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos]=t&127}function y(t,a){var h=(t&7)<<4;a.buf[a.pos++]|=h|((t>>>=3)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127|((t>>>=7)?128:0),t&&(a.buf[a.pos++]=t&127)))))}function o(t,a,h){var P=a<=16383?1:a<=2097151?2:a<=268435455?3:Math.floor(Math.log(a)/(Math.LN2*7));h.realloc(P);for(var b=h.pos-1;b>=t;b--)h.buf[b+P]=h.buf[b]}function f(t,a){for(var h=0;h<t.length;h++)a.writeVarint(t[h])}function d(t,a){for(var h=0;h<t.length;h++)a.writeSVarint(t[h])}function v(t,a){for(var h=0;h<t.length;h++)a.writeFloat(t[h])}function x(t,a){for(var h=0;h<t.length;h++)a.writeDouble(t[h])}function S(t,a){for(var h=0;h<t.length;h++)a.writeBoolean(t[h])}function _(t,a){for(var h=0;h<t.length;h++)a.writeFixed32(t[h])}function F(t,a){for(var h=0;h<t.length;h++)a.writeSFixed32(t[h])}function w(t,a){for(var h=0;h<t.length;h++)a.writeFixed64(t[h])}function L(t,a){for(var h=0;h<t.length;h++)a.writeSFixed64(t[h])}function T(t,a){return(t[a]|t[a+1]<<8|t[a+2]<<16)+t[a+3]*16777216}function M(t,a,h){t[h]=a,t[h+1]=a>>>8,t[h+2]=a>>>16,t[h+3]=a>>>24}function A(t,a){return(t[a]|t[a+1]<<8|t[a+2]<<16)+(t[a+3]<<24)}function k(t,a,h){for(var P="",b=a;b<h;){var E=t[b],N=null,D=E>239?4:E>223?3:E>191?2:1;if(b+D>h)break;var C,K,fn;D===1?E<128&&(N=E):D===2?(C=t[b+1],(C&192)===128&&(N=(E&31)<<6|C&63,N<=127&&(N=null))):D===3?(C=t[b+1],K=t[b+2],(C&192)===128&&(K&192)===128&&(N=(E&15)<<12|(C&63)<<6|K&63,(N<=2047||N>=55296&&N<=57343)&&(N=null))):D===4&&(C=t[b+1],K=t[b+2],fn=t[b+3],(C&192)===128&&(K&192)===128&&(fn&192)===128&&(N=(E&15)<<18|(C&63)<<12|(K&63)<<6|fn&63,(N<=65535||N>=1114112)&&(N=null))),N===null?(N=65533,D=1):N>65535&&(N-=65536,P+=String.fromCharCode(N>>>10&1023|55296),N=56320|N&1023),P+=String.fromCharCode(N),b+=D}return P}function B(t,a,h){return u.decode(t.subarray(a,h))}function R(t,a,h){for(var P=0,b,E;P<a.length;P++){if(b=a.charCodeAt(P),b>55295&&b<57344)if(E)if(b<56320){t[h++]=239,t[h++]=191,t[h++]=189,E=b;continue}else b=E-55296<<10|b-56320|65536,E=null;else{b>56319||P+1===a.length?(t[h++]=239,t[h++]=191,t[h++]=189):E=b;continue}else E&&(t[h++]=239,t[h++]=191,t[h++]=189,E=null);b<128?t[h++]=b:(b<2048?t[h++]=b>>6|192:(b<65536?t[h++]=b>>12|224:(t[h++]=b>>18|240,t[h++]=b>>12&63|128),t[h++]=b>>6&63|128),t[h++]=b&63|128)}return h}return en}var tn,mn;function xn(){if(mn)return tn;mn=1,tn=r;function r(n,e){this.x=n,this.y=e}return r.prototype={clone:function(){return new r(this.x,this.y)},add:function(n){return this.clone()._add(n)},sub:function(n){return this.clone()._sub(n)},multByPoint:function(n){return this.clone()._multByPoint(n)},divByPoint:function(n){return this.clone()._divByPoint(n)},mult:function(n){return this.clone()._mult(n)},div:function(n){return this.clone()._div(n)},rotate:function(n){return this.clone()._rotate(n)},rotateAround:function(n,e){return this.clone()._rotateAround(n,e)},matMult:function(n){return this.clone()._matMult(n)},unit:function(){return this.clone()._unit()},perp:function(){return this.clone()._perp()},round:function(){return this.clone()._round()},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals:function(n){return this.x===n.x&&this.y===n.y},dist:function(n){return Math.sqrt(this.distSqr(n))},distSqr:function(n){var e=n.x-this.x,s=n.y-this.y;return e*e+s*s},angle:function(){return Math.atan2(this.y,this.x)},angleTo:function(n){return Math.atan2(this.y-n.y,this.x-n.x)},angleWith:function(n){return this.angleWithSep(n.x,n.y)},angleWithSep:function(n,e){return Math.atan2(this.x*e-this.y*n,this.x*n+this.y*e)},_matMult:function(n){var e=n[0]*this.x+n[1]*this.y,s=n[2]*this.x+n[3]*this.y;return this.x=e,this.y=s,this},_add:function(n){return this.x+=n.x,this.y+=n.y,this},_sub:function(n){return this.x-=n.x,this.y-=n.y,this},_mult:function(n){return this.x*=n,this.y*=n,this},_div:function(n){return this.x/=n,this.y/=n,this},_multByPoint:function(n){return this.x*=n.x,this.y*=n.y,this},_divByPoint:function(n){return this.x/=n.x,this.y/=n.y,this},_unit:function(){return this._div(this.mag()),this},_perp:function(){var n=this.y;return this.y=this.x,this.x=-n,this},_rotate:function(n){var e=Math.cos(n),s=Math.sin(n),i=e*this.x-s*this.y,u=s*this.x+e*this.y;return this.x=i,this.y=u,this},_rotateAround:function(n,e){var s=Math.cos(n),i=Math.sin(n),u=e.x+s*(this.x-e.x)-i*(this.y-e.y),l=e.y+i*(this.x-e.x)+s*(this.y-e.y);return this.x=u,this.y=l,this},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},r.convert=function(n){return n instanceof r?n:Array.isArray(n)?new r(n[0],n[1]):n},tn}var J={},rn,wn;function bn(){if(wn)return rn;wn=1;var r=xn();rn=n;function n(l,c,p,m,g){this.properties={},this.extent=p,this.type=0,this._pbf=l,this._geometry=-1,this._keys=m,this._values=g,l.readFields(e,this,c)}function e(l,c,p){l==1?c.id=p.readVarint():l==2?s(p,c):l==3?c.type=p.readVarint():l==4&&(c._geometry=p.pos)}function s(l,c){for(var p=l.readVarint()+l.pos;l.pos<p;){var m=c._keys[l.readVarint()],g=c._values[l.readVarint()];c.properties[m]=g}}n.types=["Unknown","Point","LineString","Polygon"],n.prototype.loadGeometry=function(){var l=this._pbf;l.pos=this._geometry;for(var c=l.readVarint()+l.pos,p=1,m=0,g=0,y=0,o=[],f;l.pos<c;){if(m<=0){var d=l.readVarint();p=d&7,m=d>>3}if(m--,p===1||p===2)g+=l.readSVarint(),y+=l.readSVarint(),p===1&&(f&&o.push(f),f=[]),f.push(new r(g,y));else if(p===7)f&&f.push(f[0].clone());else throw new Error("unknown command "+p)}return f&&o.push(f),o},n.prototype.bbox=function(){var l=this._pbf;l.pos=this._geometry;for(var c=l.readVarint()+l.pos,p=1,m=0,g=0,y=0,o=1/0,f=-1/0,d=1/0,v=-1/0;l.pos<c;){if(m<=0){var x=l.readVarint();p=x&7,m=x>>3}if(m--,p===1||p===2)g+=l.readSVarint(),y+=l.readSVarint(),g<o&&(o=g),g>f&&(f=g),y<d&&(d=y),y>v&&(v=y);else if(p!==7)throw new Error("unknown command "+p)}return[o,d,f,v]},n.prototype.toGeoJSON=function(l,c,p){var m=this.extent*Math.pow(2,p),g=this.extent*l,y=this.extent*c,o=this.loadGeometry(),f=n.types[this.type],d,v;function x(F){for(var w=0;w<F.length;w++){var L=F[w],T=180-(L.y+y)*360/m;F[w]=[(L.x+g)*360/m-180,360/Math.PI*Math.atan(Math.exp(T*Math.PI/180))-90]}}switch(this.type){case 1:var S=[];for(d=0;d<o.length;d++)S[d]=o[d][0];o=S,x(o);break;case 2:for(d=0;d<o.length;d++)x(o[d]);break;case 3:for(o=i(o),d=0;d<o.length;d++)for(v=0;v<o[d].length;v++)x(o[d][v]);break}o.length===1?o=o[0]:f="Multi"+f;var _={type:"Feature",geometry:{type:f,coordinates:o},properties:this.properties};return"id"in this&&(_.id=this.id),_};function i(l){var c=l.length;if(c<=1)return[l];for(var p=[],m,g,y=0;y<c;y++){var o=u(l[y]);o!==0&&(g===void 0&&(g=o<0),g===o<0?(m&&p.push(m),m=[l[y]]):m.push(l[y]))}return m&&p.push(m),p}function u(l){for(var c=0,p=0,m=l.length,g=m-1,y,o;p<m;g=p++)y=l[p],o=l[g],c+=(o.x-y.x)*(y.y+o.y);return c}return rn}var sn,vn;function Sn(){if(vn)return sn;vn=1;var r=bn();sn=n;function n(i,u){this.version=1,this.name=null,this.extent=4096,this.length=0,this._pbf=i,this._keys=[],this._values=[],this._features=[],i.readFields(e,this,u),this.length=this._features.length}function e(i,u,l){i===15?u.version=l.readVarint():i===1?u.name=l.readString():i===5?u.extent=l.readVarint():i===2?u._features.push(l.pos):i===3?u._keys.push(l.readString()):i===4&&u._values.push(s(l))}function s(i){for(var u=null,l=i.readVarint()+i.pos;i.pos<l;){var c=i.readVarint()>>3;u=c===1?i.readString():c===2?i.readFloat():c===3?i.readDouble():c===4?i.readVarint64():c===5?i.readVarint():c===6?i.readSVarint():c===7?i.readBoolean():null}return u}return n.prototype.feature=function(i){if(i<0||i>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[i];var u=this._pbf.readVarint()+this._pbf.pos;return new r(this._pbf,u,this.extent,this._keys,this._values)},sn}var on,Pn;function ae(){if(Pn)return on;Pn=1;var r=Sn();on=n;function n(s,i){this.layers=s.readFields(e,{},i)}function e(s,i,u){if(s===3){var l=new r(u,u.readVarint()+u.pos);l.length&&(i[l.name]=l)}}return on}var _n;function le(){return _n||(_n=1,J.VectorTile=ae(),J.VectorTileFeature=bn(),J.VectorTileLayer=Sn()),J}var an,Fn;function ue(){if(Fn)return an;Fn=1;var r=xn(),n=le().VectorTileFeature;an=e;function e(i,u){this.options=u||{},this.features=i,this.length=i.length}e.prototype.feature=function(i){return new s(this.features[i],this.options.extent)};function s(i,u){this.id=typeof i.id=="number"?i.id:void 0,this.type=i.type,this.rawGeometry=i.type===1?[i.geometry]:i.geometry,this.properties=i.tags,this.extent=u||4096}return s.prototype.loadGeometry=function(){var i=this.rawGeometry;this.geometry=[];for(var u=0;u<i.length;u++){for(var l=i[u],c=[],p=0;p<l.length;p++)c.push(new r(l[p][0],l[p][1]));this.geometry.push(c)}return this.geometry},s.prototype.bbox=function(){this.geometry||this.loadGeometry();for(var i=this.geometry,u=1/0,l=-1/0,c=1/0,p=-1/0,m=0;m<i.length;m++)for(var g=i[m],y=0;y<g.length;y++){var o=g[y];u=Math.min(u,o.x),l=Math.max(l,o.x),c=Math.min(c,o.y),p=Math.max(p,o.y)}return[u,c,l,p]},s.prototype.toGeoJSON=n.prototype.toGeoJSON,an}var En;function he(){if(En)return H.exports;En=1;var r=oe(),n=ue();H.exports=e,H.exports.fromVectorTileJs=e,H.exports.fromGeojsonVt=s,H.exports.GeoJSONWrapper=n;function e(o){var f=new r;return i(o,f),f.finish()}function s(o,f){f=f||{};var d={};for(var v in o)d[v]=new n(o[v].features,f),d[v].name=v,d[v].version=f.version,d[v].extent=f.extent;return e({layers:d})}function i(o,f){for(var d in o.layers)f.writeMessage(3,u,o.layers[d])}function u(o,f){f.writeVarintField(15,o.version||1),f.writeStringField(1,o.name||""),f.writeVarintField(5,o.extent||4096);var d,v={keys:[],values:[],keycache:{},valuecache:{}};for(d=0;d<o.length;d++)v.feature=o.feature(d),f.writeMessage(2,l,v);var x=v.keys;for(d=0;d<x.length;d++)f.writeStringField(3,x[d]);var S=v.values;for(d=0;d<S.length;d++)f.writeMessage(4,y,S[d])}function l(o,f){var d=o.feature;d.id!==void 0&&f.writeVarintField(1,d.id),f.writeMessage(2,c,o),f.writeVarintField(3,d.type),f.writeMessage(4,g,d)}function c(o,f){var d=o.feature,v=o.keys,x=o.values,S=o.keycache,_=o.valuecache;for(var F in d.properties){var w=d.properties[F],L=S[F];if(w!==null){typeof L>"u"&&(v.push(F),L=v.length-1,S[F]=L),f.writeVarint(L);var T=typeof w;T!=="string"&&T!=="boolean"&&T!=="number"&&(w=JSON.stringify(w));var M=T+":"+w,A=_[M];typeof A>"u"&&(x.push(w),A=x.length-1,_[M]=A),f.writeVarint(A)}}}function p(o,f){return(f<<3)+(o&7)}function m(o){return o<<1^o>>31}function g(o,f){for(var d=o.loadGeometry(),v=o.type,x=0,S=0,_=d.length,F=0;F<_;F++){var w=d[F],L=1;v===1&&(L=w.length),f.writeVarint(p(1,L));for(var T=v===3?w.length-1:w.length,M=0;M<T;M++){M===1&&v!==1&&f.writeVarint(p(2,T-1));var A=w[M].x-x,k=w[M].y-S;f.writeVarint(m(A)),f.writeVarint(m(k)),x+=A,S+=k}v===3&&f.writeVarint(p(7,1))}}function y(o,f){var d=typeof o;d==="string"?f.writeStringField(1,o):d==="boolean"?f.writeBooleanField(7,o):d==="number"&&(o%1!==0?f.writeDoubleField(3,o):o<0?f.writeSVarintField(6,o):f.writeVarintField(5,o))}return H.exports}var fe=he();const Mn=ie(fe),An=`var jt = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Qe = Math.ceil, re = Math.floor, j = "[BigNumber Error] ", yt = j + "Number primitive has more than 15 significant digits: ", se = 1e14, G = 14, je = 9007199254740991, et = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], ye = 1e7, X = 1e9;
function Dt(t) {
  var e, r, n, i = d.prototype = { constructor: d, toString: null, valueOf: null }, o = new d(1), a = 20, f = 4, h = -7, c = 21, E = -1e7, m = 1e7, S = !1, A = 1, T = 0, M = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, _ = "0123456789abcdefghijklmnopqrstuvwxyz", L = !0;
  function d(s, u) {
    var l, p, g, w, v, y, x, P, b = this;
    if (!(b instanceof d)) return new d(s, u);
    if (u == null) {
      if (s && s._isBigNumber === !0) {
        b.s = s.s, !s.c || s.e > m ? b.c = b.e = null : s.e < E ? b.c = [b.e = 0] : (b.e = s.e, b.c = s.c.slice());
        return;
      }
      if ((y = typeof s == "number") && s * 0 == 0) {
        if (b.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (w = 0, v = s; v >= 10; v /= 10, w++) ;
          w > m ? b.c = b.e = null : (b.e = w, b.c = [s]);
          return;
        }
        P = String(s);
      } else {
        if (!jt.test(P = String(s))) return n(b, P, y);
        b.s = P.charCodeAt(0) == 45 ? (P = P.slice(1), -1) : 1;
      }
      (w = P.indexOf(".")) > -1 && (P = P.replace(".", "")), (v = P.search(/e/i)) > 0 ? (w < 0 && (w = v), w += +P.slice(v + 1), P = P.substring(0, v)) : w < 0 && (w = P.length);
    } else {
      if (V(u, 2, _.length, "Base"), u == 10 && L)
        return b = new d(s), O(b, a + b.e + 1, f);
      if (P = String(s), y = typeof s == "number") {
        if (s * 0 != 0) return n(b, P, y, u);
        if (b.s = 1 / s < 0 ? (P = P.slice(1), -1) : 1, d.DEBUG && P.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(yt + s);
      } else
        b.s = P.charCodeAt(0) === 45 ? (P = P.slice(1), -1) : 1;
      for (l = _.slice(0, u), w = v = 0, x = P.length; v < x; v++)
        if (l.indexOf(p = P.charAt(v)) < 0) {
          if (p == ".") {
            if (v > w) {
              w = x;
              continue;
            }
          } else if (!g && (P == P.toUpperCase() && (P = P.toLowerCase()) || P == P.toLowerCase() && (P = P.toUpperCase()))) {
            g = !0, v = -1, w = 0;
            continue;
          }
          return n(b, String(s), y, u);
        }
      y = !1, P = r(P, u, 10, b.s), (w = P.indexOf(".")) > -1 ? P = P.replace(".", "") : w = P.length;
    }
    for (v = 0; P.charCodeAt(v) === 48; v++) ;
    for (x = P.length; P.charCodeAt(--x) === 48; ) ;
    if (P = P.slice(v, ++x)) {
      if (x -= v, y && d.DEBUG && x > 15 && (s > je || s !== re(s)))
        throw Error(yt + b.s * s);
      if ((w = w - v - 1) > m)
        b.c = b.e = null;
      else if (w < E)
        b.c = [b.e = 0];
      else {
        if (b.e = w, b.c = [], v = (w + 1) % G, w < 0 && (v += G), v < x) {
          for (v && b.c.push(+P.slice(0, v)), x -= G; v < x; )
            b.c.push(+P.slice(v, v += G));
          v = G - (P = P.slice(v)).length;
        } else
          v -= x;
        for (; v--; P += "0") ;
        b.c.push(+P);
      }
    } else
      b.c = [b.e = 0];
  }
  d.clone = Dt, d.ROUND_UP = 0, d.ROUND_DOWN = 1, d.ROUND_CEIL = 2, d.ROUND_FLOOR = 3, d.ROUND_HALF_UP = 4, d.ROUND_HALF_DOWN = 5, d.ROUND_HALF_EVEN = 6, d.ROUND_HALF_CEIL = 7, d.ROUND_HALF_FLOOR = 8, d.EUCLID = 9, d.config = d.set = function(s) {
    var u, l;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(u = "DECIMAL_PLACES") && (l = s[u], V(l, 0, X, u), a = l), s.hasOwnProperty(u = "ROUNDING_MODE") && (l = s[u], V(l, 0, 8, u), f = l), s.hasOwnProperty(u = "EXPONENTIAL_AT") && (l = s[u], l && l.pop ? (V(l[0], -X, 0, u), V(l[1], 0, X, u), h = l[0], c = l[1]) : (V(l, -X, X, u), h = -(c = l < 0 ? -l : l))), s.hasOwnProperty(u = "RANGE"))
          if (l = s[u], l && l.pop)
            V(l[0], -X, -1, u), V(l[1], 1, X, u), E = l[0], m = l[1];
          else if (V(l, -X, X, u), l)
            E = -(m = l < 0 ? -l : l);
          else
            throw Error(j + u + " cannot be zero: " + l);
        if (s.hasOwnProperty(u = "CRYPTO"))
          if (l = s[u], l === !!l)
            if (l)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                S = l;
              else
                throw S = !l, Error(j + "crypto unavailable");
            else
              S = l;
          else
            throw Error(j + u + " not true or false: " + l);
        if (s.hasOwnProperty(u = "MODULO_MODE") && (l = s[u], V(l, 0, 9, u), A = l), s.hasOwnProperty(u = "POW_PRECISION") && (l = s[u], V(l, 0, X, u), T = l), s.hasOwnProperty(u = "FORMAT"))
          if (l = s[u], typeof l == "object") M = l;
          else throw Error(j + u + " not an object: " + l);
        if (s.hasOwnProperty(u = "ALPHABET"))
          if (l = s[u], typeof l == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(l))
            L = l.slice(0, 10) == "0123456789", _ = l;
          else
            throw Error(j + u + " invalid: " + l);
      } else
        throw Error(j + "Object expected: " + s);
    return {
      DECIMAL_PLACES: a,
      ROUNDING_MODE: f,
      EXPONENTIAL_AT: [h, c],
      RANGE: [E, m],
      CRYPTO: S,
      MODULO_MODE: A,
      POW_PRECISION: T,
      FORMAT: M,
      ALPHABET: _
    };
  }, d.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!d.DEBUG) return !0;
    var u, l, p = s.c, g = s.e, w = s.s;
    e: if ({}.toString.call(p) == "[object Array]") {
      if ((w === 1 || w === -1) && g >= -X && g <= X && g === re(g)) {
        if (p[0] === 0) {
          if (g === 0 && p.length === 1) return !0;
          break e;
        }
        if (u = (g + 1) % G, u < 1 && (u += G), String(p[0]).length == u) {
          for (u = 0; u < p.length; u++)
            if (l = p[u], l < 0 || l >= se || l !== re(l)) break e;
          if (l !== 0) return !0;
        }
      }
    } else if (p === null && g === null && (w === null || w === 1 || w === -1))
      return !0;
    throw Error(j + "Invalid BigNumber: " + s);
  }, d.maximum = d.max = function() {
    return k(arguments, -1);
  }, d.minimum = d.min = function() {
    return k(arguments, 1);
  }, d.random = (function() {
    var s = 9007199254740992, u = Math.random() * s & 2097151 ? function() {
      return re(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(l) {
      var p, g, w, v, y, x = 0, P = [], b = new d(o);
      if (l == null ? l = a : V(l, 0, X), v = Qe(l / G), S)
        if (crypto.getRandomValues) {
          for (p = crypto.getRandomValues(new Uint32Array(v *= 2)); x < v; )
            y = p[x] * 131072 + (p[x + 1] >>> 11), y >= 9e15 ? (g = crypto.getRandomValues(new Uint32Array(2)), p[x] = g[0], p[x + 1] = g[1]) : (P.push(y % 1e14), x += 2);
          x = v / 2;
        } else if (crypto.randomBytes) {
          for (p = crypto.randomBytes(v *= 7); x < v; )
            y = (p[x] & 31) * 281474976710656 + p[x + 1] * 1099511627776 + p[x + 2] * 4294967296 + p[x + 3] * 16777216 + (p[x + 4] << 16) + (p[x + 5] << 8) + p[x + 6], y >= 9e15 ? crypto.randomBytes(7).copy(p, x) : (P.push(y % 1e14), x += 7);
          x = v / 7;
        } else
          throw S = !1, Error(j + "crypto unavailable");
      if (!S)
        for (; x < v; )
          y = u(), y < 9e15 && (P[x++] = y % 1e14);
      for (v = P[--x], l %= G, v && l && (y = et[G - l], P[x] = re(v / y) * y); P[x] === 0; P.pop(), x--) ;
      if (x < 0)
        P = [w = 0];
      else {
        for (w = -1; P[0] === 0; P.splice(0, 1), w -= G) ;
        for (x = 1, y = P[0]; y >= 10; y /= 10, x++) ;
        x < G && (w -= G - x);
      }
      return b.e = w, b.c = P, b;
    };
  })(), d.sum = function() {
    for (var s = 1, u = arguments, l = new d(u[0]); s < u.length; ) l = l.plus(u[s++]);
    return l;
  }, r = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function u(l, p, g, w) {
      for (var v, y = [0], x, P = 0, b = l.length; P < b; ) {
        for (x = y.length; x--; y[x] *= p) ;
        for (y[0] += w.indexOf(l.charAt(P++)), v = 0; v < y.length; v++)
          y[v] > g - 1 && (y[v + 1] == null && (y[v + 1] = 0), y[v + 1] += y[v] / g | 0, y[v] %= g);
      }
      return y.reverse();
    }
    return function(l, p, g, w, v) {
      var y, x, P, b, N, F, B, H, z = l.indexOf("."), K = a, q = f;
      for (z >= 0 && (b = T, T = 0, l = l.replace(".", ""), H = new d(p), F = H.pow(l.length - z), T = b, H.c = u(
        ce(te(F.c), F.e, "0"),
        10,
        g,
        s
      ), H.e = H.c.length), B = u(l, p, g, v ? (y = _, s) : (y = s, _)), P = b = B.length; B[--b] == 0; B.pop()) ;
      if (!B[0]) return y.charAt(0);
      if (z < 0 ? --P : (F.c = B, F.e = P, F.s = w, F = e(F, H, K, q, g), B = F.c, N = F.r, P = F.e), x = P + K + 1, z = B[x], b = g / 2, N = N || x < 0 || B[x + 1] != null, N = q < 4 ? (z != null || N) && (q == 0 || q == (F.s < 0 ? 3 : 2)) : z > b || z == b && (q == 4 || N || q == 6 && B[x - 1] & 1 || q == (F.s < 0 ? 8 : 7)), x < 1 || !B[0])
        l = N ? ce(y.charAt(1), -K, y.charAt(0)) : y.charAt(0);
      else {
        if (B.length = x, N)
          for (--g; ++B[--x] > g; )
            B[x] = 0, x || (++P, B = [1].concat(B));
        for (b = B.length; !B[--b]; ) ;
        for (z = 0, l = ""; z <= b; l += y.charAt(B[z++])) ;
        l = ce(l, P, y.charAt(0));
      }
      return l;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(p, g, w) {
      var v, y, x, P, b = 0, N = p.length, F = g % ye, B = g / ye | 0;
      for (p = p.slice(); N--; )
        x = p[N] % ye, P = p[N] / ye | 0, v = B * x + P * F, y = F * x + v % ye * ye + b, b = (y / w | 0) + (v / ye | 0) + B * P, p[N] = y % w;
      return b && (p = [b].concat(p)), p;
    }
    function u(p, g, w, v) {
      var y, x;
      if (w != v)
        x = w > v ? 1 : -1;
      else
        for (y = x = 0; y < w; y++)
          if (p[y] != g[y]) {
            x = p[y] > g[y] ? 1 : -1;
            break;
          }
      return x;
    }
    function l(p, g, w, v) {
      for (var y = 0; w--; )
        p[w] -= y, y = p[w] < g[w] ? 1 : 0, p[w] = y * v + p[w] - g[w];
      for (; !p[0] && p.length > 1; p.splice(0, 1)) ;
    }
    return function(p, g, w, v, y) {
      var x, P, b, N, F, B, H, z, K, q, D, Y, ke, Ze, We, le, Se, ee = p.s == g.s ? 1 : -1, Z = p.c, $ = g.c;
      if (!Z || !Z[0] || !$ || !$[0])
        return new d(
          // Return NaN if either NaN, or both Infinity or 0.
          !p.s || !g.s || (Z ? $ && Z[0] == $[0] : !$) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            Z && Z[0] == 0 || !$ ? ee * 0 : ee / 0
          )
        );
      for (z = new d(ee), K = z.c = [], P = p.e - g.e, ee = w + P + 1, y || (y = se, P = ne(p.e / G) - ne(g.e / G), ee = ee / G | 0), b = 0; $[b] == (Z[b] || 0); b++) ;
      if ($[b] > (Z[b] || 0) && P--, ee < 0)
        K.push(1), N = !0;
      else {
        for (Ze = Z.length, le = $.length, b = 0, ee += 2, F = re(y / ($[0] + 1)), F > 1 && ($ = s($, F, y), Z = s(Z, F, y), le = $.length, Ze = Z.length), ke = le, q = Z.slice(0, le), D = q.length; D < le; q[D++] = 0) ;
        Se = $.slice(), Se = [0].concat(Se), We = $[0], $[1] >= y / 2 && We++;
        do {
          if (F = 0, x = u($, q, le, D), x < 0) {
            if (Y = q[0], le != D && (Y = Y * y + (q[1] || 0)), F = re(Y / We), F > 1)
              for (F >= y && (F = y - 1), B = s($, F, y), H = B.length, D = q.length; u(B, q, H, D) == 1; )
                F--, l(B, le < H ? Se : $, H, y), H = B.length, x = 1;
            else
              F == 0 && (x = F = 1), B = $.slice(), H = B.length;
            if (H < D && (B = [0].concat(B)), l(q, B, D, y), D = q.length, x == -1)
              for (; u($, q, le, D) < 1; )
                F++, l(q, le < D ? Se : $, D, y), D = q.length;
          } else x === 0 && (F++, q = [0]);
          K[b++] = F, q[0] ? q[D++] = Z[ke] || 0 : (q = [Z[ke]], D = 1);
        } while ((ke++ < Ze || q[0] != null) && ee--);
        N = q[0] != null, K[0] || K.splice(0, 1);
      }
      if (y == se) {
        for (b = 1, ee = K[0]; ee >= 10; ee /= 10, b++) ;
        O(z, w + (z.e = b + P * G - 1) + 1, v, N);
      } else
        z.e = P, z.r = +N;
      return z;
    };
  })();
  function R(s, u, l, p) {
    var g, w, v, y, x;
    if (l == null ? l = f : V(l, 0, 8), !s.c) return s.toString();
    if (g = s.c[0], v = s.e, u == null)
      x = te(s.c), x = p == 1 || p == 2 && (v <= h || v >= c) ? Be(x, v) : ce(x, v, "0");
    else if (s = O(new d(s), u, l), w = s.e, x = te(s.c), y = x.length, p == 1 || p == 2 && (u <= w || w <= h)) {
      for (; y < u; x += "0", y++) ;
      x = Be(x, w);
    } else if (u -= v + (p === 2 && w > v), x = ce(x, w, "0"), w + 1 > y) {
      if (--u > 0) for (x += "."; u--; x += "0") ;
    } else if (u += w - y, u > 0)
      for (w + 1 == y && (x += "."); u--; x += "0") ;
    return s.s < 0 && g ? "-" + x : x;
  }
  function k(s, u) {
    for (var l, p, g = 1, w = new d(s[0]); g < s.length; g++)
      p = new d(s[g]), (!p.s || (l = de(w, p)) === u || l === 0 && w.s === u) && (w = p);
    return w;
  }
  function I(s, u, l) {
    for (var p = 1, g = u.length; !u[--g]; u.pop()) ;
    for (g = u[0]; g >= 10; g /= 10, p++) ;
    return (l = p + l * G - 1) > m ? s.c = s.e = null : l < E ? s.c = [s.e = 0] : (s.e = l, s.c = u), s;
  }
  n = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, u = /^([^.]+)\\.$/, l = /^\\.([^.]+)$/, p = /^-?(Infinity|NaN)$/, g = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(w, v, y, x) {
      var P, b = y ? v : v.replace(g, "");
      if (p.test(b))
        w.s = isNaN(b) ? null : b < 0 ? -1 : 1;
      else {
        if (!y && (b = b.replace(s, function(N, F, B) {
          return P = (B = B.toLowerCase()) == "x" ? 16 : B == "b" ? 2 : 8, !x || x == P ? F : N;
        }), x && (P = x, b = b.replace(u, "$1").replace(l, "0.$1")), v != b))
          return new d(b, P);
        if (d.DEBUG)
          throw Error(j + "Not a" + (x ? " base " + x : "") + " number: " + v);
        w.s = null;
      }
      w.c = w.e = null;
    };
  })();
  function O(s, u, l, p) {
    var g, w, v, y, x, P, b, N = s.c, F = et;
    if (N) {
      e: {
        for (g = 1, y = N[0]; y >= 10; y /= 10, g++) ;
        if (w = u - g, w < 0)
          w += G, v = u, x = N[P = 0], b = re(x / F[g - v - 1] % 10);
        else if (P = Qe((w + 1) / G), P >= N.length)
          if (p) {
            for (; N.length <= P; N.push(0)) ;
            x = b = 0, g = 1, w %= G, v = w - G + 1;
          } else
            break e;
        else {
          for (x = y = N[P], g = 1; y >= 10; y /= 10, g++) ;
          w %= G, v = w - G + g, b = v < 0 ? 0 : re(x / F[g - v - 1] % 10);
        }
        if (p = p || u < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        N[P + 1] != null || (v < 0 ? x : x % F[g - v - 1]), p = l < 4 ? (b || p) && (l == 0 || l == (s.s < 0 ? 3 : 2)) : b > 5 || b == 5 && (l == 4 || p || l == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (w > 0 ? v > 0 ? x / F[g - v] : 0 : N[P - 1]) % 10 & 1 || l == (s.s < 0 ? 8 : 7)), u < 1 || !N[0])
          return N.length = 0, p ? (u -= s.e + 1, N[0] = F[(G - u % G) % G], s.e = -u || 0) : N[0] = s.e = 0, s;
        if (w == 0 ? (N.length = P, y = 1, P--) : (N.length = P + 1, y = F[G - w], N[P] = v > 0 ? re(x / F[g - v] % F[v]) * y : 0), p)
          for (; ; )
            if (P == 0) {
              for (w = 1, v = N[0]; v >= 10; v /= 10, w++) ;
              for (v = N[0] += y, y = 1; v >= 10; v /= 10, y++) ;
              w != y && (s.e++, N[0] == se && (N[0] = 1));
              break;
            } else {
              if (N[P] += y, N[P] != se) break;
              N[P--] = 0, y = 1;
            }
        for (w = N.length; N[--w] === 0; N.pop()) ;
      }
      s.e > m ? s.c = s.e = null : s.e < E && (s.c = [s.e = 0]);
    }
    return s;
  }
  function C(s) {
    var u, l = s.e;
    return l === null ? s.toString() : (u = te(s.c), u = l <= h || l >= c ? Be(u, l) : ce(u, l, "0"), s.s < 0 ? "-" + u : u);
  }
  return i.absoluteValue = i.abs = function() {
    var s = new d(this);
    return s.s < 0 && (s.s = 1), s;
  }, i.comparedTo = function(s, u) {
    return de(this, new d(s, u));
  }, i.decimalPlaces = i.dp = function(s, u) {
    var l, p, g, w = this;
    if (s != null)
      return V(s, 0, X), u == null ? u = f : V(u, 0, 8), O(new d(w), s + w.e + 1, u);
    if (!(l = w.c)) return null;
    if (p = ((g = l.length - 1) - ne(this.e / G)) * G, g = l[g]) for (; g % 10 == 0; g /= 10, p--) ;
    return p < 0 && (p = 0), p;
  }, i.dividedBy = i.div = function(s, u) {
    return e(this, new d(s, u), a, f);
  }, i.dividedToIntegerBy = i.idiv = function(s, u) {
    return e(this, new d(s, u), 0, 1);
  }, i.exponentiatedBy = i.pow = function(s, u) {
    var l, p, g, w, v, y, x, P, b, N = this;
    if (s = new d(s), s.c && !s.isInteger())
      throw Error(j + "Exponent not an integer: " + C(s));
    if (u != null && (u = new d(u)), y = s.e > 14, !N.c || !N.c[0] || N.c[0] == 1 && !N.e && N.c.length == 1 || !s.c || !s.c[0])
      return b = new d(Math.pow(+C(N), y ? s.s * (2 - Fe(s)) : +C(s))), u ? b.mod(u) : b;
    if (x = s.s < 0, u) {
      if (u.c ? !u.c[0] : !u.s) return new d(NaN);
      p = !x && N.isInteger() && u.isInteger(), p && (N = N.mod(u));
    } else {
      if (s.e > 9 && (N.e > 0 || N.e < -1 || (N.e == 0 ? N.c[0] > 1 || y && N.c[1] >= 24e7 : N.c[0] < 8e13 || y && N.c[0] <= 9999975e7)))
        return w = N.s < 0 && Fe(s) ? -0 : 0, N.e > -1 && (w = 1 / w), new d(x ? 1 / w : w);
      T && (w = Qe(T / G + 2));
    }
    for (y ? (l = new d(0.5), x && (s.s = 1), P = Fe(s)) : (g = Math.abs(+C(s)), P = g % 2), b = new d(o); ; ) {
      if (P) {
        if (b = b.times(N), !b.c) break;
        w ? b.c.length > w && (b.c.length = w) : p && (b = b.mod(u));
      }
      if (g) {
        if (g = re(g / 2), g === 0) break;
        P = g % 2;
      } else if (s = s.times(l), O(s, s.e + 1, 1), s.e > 14)
        P = Fe(s);
      else {
        if (g = +C(s), g === 0) break;
        P = g % 2;
      }
      N = N.times(N), w ? N.c && N.c.length > w && (N.c.length = w) : p && (N = N.mod(u));
    }
    return p ? b : (x && (b = o.div(b)), u ? b.mod(u) : w ? O(b, T, f, v) : b);
  }, i.integerValue = function(s) {
    var u = new d(this);
    return s == null ? s = f : V(s, 0, 8), O(u, u.e + 1, s);
  }, i.isEqualTo = i.eq = function(s, u) {
    return de(this, new d(s, u)) === 0;
  }, i.isFinite = function() {
    return !!this.c;
  }, i.isGreaterThan = i.gt = function(s, u) {
    return de(this, new d(s, u)) > 0;
  }, i.isGreaterThanOrEqualTo = i.gte = function(s, u) {
    return (u = de(this, new d(s, u))) === 1 || u === 0;
  }, i.isInteger = function() {
    return !!this.c && ne(this.e / G) > this.c.length - 2;
  }, i.isLessThan = i.lt = function(s, u) {
    return de(this, new d(s, u)) < 0;
  }, i.isLessThanOrEqualTo = i.lte = function(s, u) {
    return (u = de(this, new d(s, u))) === -1 || u === 0;
  }, i.isNaN = function() {
    return !this.s;
  }, i.isNegative = function() {
    return this.s < 0;
  }, i.isPositive = function() {
    return this.s > 0;
  }, i.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, i.minus = function(s, u) {
    var l, p, g, w, v = this, y = v.s;
    if (s = new d(s, u), u = s.s, !y || !u) return new d(NaN);
    if (y != u)
      return s.s = -u, v.plus(s);
    var x = v.e / G, P = s.e / G, b = v.c, N = s.c;
    if (!x || !P) {
      if (!b || !N) return b ? (s.s = -u, s) : new d(N ? v : NaN);
      if (!b[0] || !N[0])
        return N[0] ? (s.s = -u, s) : new d(b[0] ? v : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          f == 3 ? -0 : 0
        ));
    }
    if (x = ne(x), P = ne(P), b = b.slice(), y = x - P) {
      for ((w = y < 0) ? (y = -y, g = b) : (P = x, g = N), g.reverse(), u = y; u--; g.push(0)) ;
      g.reverse();
    } else
      for (p = (w = (y = b.length) < (u = N.length)) ? y : u, y = u = 0; u < p; u++)
        if (b[u] != N[u]) {
          w = b[u] < N[u];
          break;
        }
    if (w && (g = b, b = N, N = g, s.s = -s.s), u = (p = N.length) - (l = b.length), u > 0) for (; u--; b[l++] = 0) ;
    for (u = se - 1; p > y; ) {
      if (b[--p] < N[p]) {
        for (l = p; l && !b[--l]; b[l] = u) ;
        --b[l], b[p] += se;
      }
      b[p] -= N[p];
    }
    for (; b[0] == 0; b.splice(0, 1), --P) ;
    return b[0] ? I(s, b, P) : (s.s = f == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, i.modulo = i.mod = function(s, u) {
    var l, p, g = this;
    return s = new d(s, u), !g.c || !s.s || s.c && !s.c[0] ? new d(NaN) : !s.c || g.c && !g.c[0] ? new d(g) : (A == 9 ? (p = s.s, s.s = 1, l = e(g, s, 0, 3), s.s = p, l.s *= p) : l = e(g, s, 0, A), s = g.minus(l.times(s)), !s.c[0] && A == 1 && (s.s = g.s), s);
  }, i.multipliedBy = i.times = function(s, u) {
    var l, p, g, w, v, y, x, P, b, N, F, B, H, z, K, q = this, D = q.c, Y = (s = new d(s, u)).c;
    if (!D || !Y || !D[0] || !Y[0])
      return !q.s || !s.s || D && !D[0] && !Y || Y && !Y[0] && !D ? s.c = s.e = s.s = null : (s.s *= q.s, !D || !Y ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (p = ne(q.e / G) + ne(s.e / G), s.s *= q.s, x = D.length, N = Y.length, x < N && (H = D, D = Y, Y = H, g = x, x = N, N = g), g = x + N, H = []; g--; H.push(0)) ;
    for (z = se, K = ye, g = N; --g >= 0; ) {
      for (l = 0, F = Y[g] % K, B = Y[g] / K | 0, v = x, w = g + v; w > g; )
        P = D[--v] % K, b = D[v] / K | 0, y = B * P + b * F, P = F * P + y % K * K + H[w] + l, l = (P / z | 0) + (y / K | 0) + B * b, H[w--] = P % z;
      H[w] = l;
    }
    return l ? ++p : H.splice(0, 1), I(s, H, p);
  }, i.negated = function() {
    var s = new d(this);
    return s.s = -s.s || null, s;
  }, i.plus = function(s, u) {
    var l, p = this, g = p.s;
    if (s = new d(s, u), u = s.s, !g || !u) return new d(NaN);
    if (g != u)
      return s.s = -u, p.minus(s);
    var w = p.e / G, v = s.e / G, y = p.c, x = s.c;
    if (!w || !v) {
      if (!y || !x) return new d(g / 0);
      if (!y[0] || !x[0]) return x[0] ? s : new d(y[0] ? p : g * 0);
    }
    if (w = ne(w), v = ne(v), y = y.slice(), g = w - v) {
      for (g > 0 ? (v = w, l = x) : (g = -g, l = y), l.reverse(); g--; l.push(0)) ;
      l.reverse();
    }
    for (g = y.length, u = x.length, g - u < 0 && (l = x, x = y, y = l, u = g), g = 0; u; )
      g = (y[--u] = y[u] + x[u] + g) / se | 0, y[u] = se === y[u] ? 0 : y[u] % se;
    return g && (y = [g].concat(y), ++v), I(s, y, v);
  }, i.precision = i.sd = function(s, u) {
    var l, p, g, w = this;
    if (s != null && s !== !!s)
      return V(s, 1, X), u == null ? u = f : V(u, 0, 8), O(new d(w), s, u);
    if (!(l = w.c)) return null;
    if (g = l.length - 1, p = g * G + 1, g = l[g]) {
      for (; g % 10 == 0; g /= 10, p--) ;
      for (g = l[0]; g >= 10; g /= 10, p++) ;
    }
    return s && w.e + 1 > p && (p = w.e + 1), p;
  }, i.shiftedBy = function(s) {
    return V(s, -je, je), this.times("1e" + s);
  }, i.squareRoot = i.sqrt = function() {
    var s, u, l, p, g, w = this, v = w.c, y = w.s, x = w.e, P = a + 4, b = new d("0.5");
    if (y !== 1 || !v || !v[0])
      return new d(!y || y < 0 && (!v || v[0]) ? NaN : v ? w : 1 / 0);
    if (y = Math.sqrt(+C(w)), y == 0 || y == 1 / 0 ? (u = te(v), (u.length + x) % 2 == 0 && (u += "0"), y = Math.sqrt(+u), x = ne((x + 1) / 2) - (x < 0 || x % 2), y == 1 / 0 ? u = "5e" + x : (u = y.toExponential(), u = u.slice(0, u.indexOf("e") + 1) + x), l = new d(u)) : l = new d(y + ""), l.c[0]) {
      for (x = l.e, y = x + P, y < 3 && (y = 0); ; )
        if (g = l, l = b.times(g.plus(e(w, g, P, 1))), te(g.c).slice(0, y) === (u = te(l.c)).slice(0, y))
          if (l.e < x && --y, u = u.slice(y - 3, y + 1), u == "9999" || !p && u == "4999") {
            if (!p && (O(g, g.e + a + 2, 0), g.times(g).eq(w))) {
              l = g;
              break;
            }
            P += 4, y += 4, p = 1;
          } else {
            (!+u || !+u.slice(1) && u.charAt(0) == "5") && (O(l, l.e + a + 2, 1), s = !l.times(l).eq(w));
            break;
          }
    }
    return O(l, l.e + a + 1, f, s);
  }, i.toExponential = function(s, u) {
    return s != null && (V(s, 0, X), s++), R(this, s, u, 1);
  }, i.toFixed = function(s, u) {
    return s != null && (V(s, 0, X), s = s + this.e + 1), R(this, s, u);
  }, i.toFormat = function(s, u, l) {
    var p, g = this;
    if (l == null)
      s != null && u && typeof u == "object" ? (l = u, u = null) : s && typeof s == "object" ? (l = s, s = u = null) : l = M;
    else if (typeof l != "object")
      throw Error(j + "Argument not an object: " + l);
    if (p = g.toFixed(s, u), g.c) {
      var w, v = p.split("."), y = +l.groupSize, x = +l.secondaryGroupSize, P = l.groupSeparator || "", b = v[0], N = v[1], F = g.s < 0, B = F ? b.slice(1) : b, H = B.length;
      if (x && (w = y, y = x, x = w, H -= w), y > 0 && H > 0) {
        for (w = H % y || y, b = B.substr(0, w); w < H; w += y) b += P + B.substr(w, y);
        x > 0 && (b += P + B.slice(w)), F && (b = "-" + b);
      }
      p = N ? b + (l.decimalSeparator || "") + ((x = +l.fractionGroupSize) ? N.replace(
        new RegExp("\\\\d{" + x + "}\\\\B", "g"),
        "$&" + (l.fractionGroupSeparator || "")
      ) : N) : b;
    }
    return (l.prefix || "") + p + (l.suffix || "");
  }, i.toFraction = function(s) {
    var u, l, p, g, w, v, y, x, P, b, N, F, B = this, H = B.c;
    if (s != null && (y = new d(s), !y.isInteger() && (y.c || y.s !== 1) || y.lt(o)))
      throw Error(j + "Argument " + (y.isInteger() ? "out of range: " : "not an integer: ") + C(y));
    if (!H) return new d(B);
    for (u = new d(o), P = l = new d(o), p = x = new d(o), F = te(H), w = u.e = F.length - B.e - 1, u.c[0] = et[(v = w % G) < 0 ? G + v : v], s = !s || y.comparedTo(u) > 0 ? w > 0 ? u : P : y, v = m, m = 1 / 0, y = new d(F), x.c[0] = 0; b = e(y, u, 0, 1), g = l.plus(b.times(p)), g.comparedTo(s) != 1; )
      l = p, p = g, P = x.plus(b.times(g = P)), x = g, u = y.minus(b.times(g = u)), y = g;
    return g = e(s.minus(l), p, 0, 1), x = x.plus(g.times(P)), l = l.plus(g.times(p)), x.s = P.s = B.s, w = w * 2, N = e(P, p, w, f).minus(B).abs().comparedTo(
      e(x, l, w, f).minus(B).abs()
    ) < 1 ? [P, p] : [x, l], m = v, N;
  }, i.toNumber = function() {
    return +C(this);
  }, i.toPrecision = function(s, u) {
    return s != null && V(s, 1, X), R(this, s, u, 2);
  }, i.toString = function(s) {
    var u, l = this, p = l.s, g = l.e;
    return g === null ? p ? (u = "Infinity", p < 0 && (u = "-" + u)) : u = "NaN" : (s == null ? u = g <= h || g >= c ? Be(te(l.c), g) : ce(te(l.c), g, "0") : s === 10 && L ? (l = O(new d(l), a + g + 1, f), u = ce(te(l.c), l.e, "0")) : (V(s, 2, _.length, "Base"), u = r(ce(te(l.c), g, "0"), 10, s, p, !0)), p < 0 && l.c[0] && (u = "-" + u)), u;
  }, i.valueOf = i.toJSON = function() {
    return C(this);
  }, i._isBigNumber = !0, i[Symbol.toStringTag] = "BigNumber", i[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = i.valueOf, t != null && d.set(t), d;
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
  var r, n, i = t.c, o = e.c, a = t.s, f = e.s, h = t.e, c = e.e;
  if (!a || !f) return null;
  if (r = i && !i[0], n = o && !o[0], r || n) return r ? n ? 0 : -f : a;
  if (a != f) return a;
  if (r = a < 0, n = h == c, !i || !o) return n ? 0 : !i ^ r ? 1 : -1;
  if (!n) return h > c ^ r ? 1 : -1;
  for (f = (h = i.length) < (c = o.length) ? h : c, a = 0; a < f; a++) if (i[a] != o[a]) return i[a] > o[a] ^ r ? 1 : -1;
  return h == c ? 0 : h > c ^ r ? 1 : -1;
}
function V(t, e, r, n) {
  if (t < e || t > r || t !== re(t))
    throw Error(j + (n || "Argument") + (typeof t == "number" ? t < e || t > r ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(t));
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
var fe = Dt(), er = class {
  key;
  left = null;
  right = null;
  constructor(t) {
    this.key = t;
  }
}, Pe = class extends er {
  constructor(t) {
    super(t);
  }
}, tr = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(t) {
    const e = this.root;
    if (e == null)
      return this.compare(t, t), -1;
    let r = null, n = null, i = null, o = null, a = e;
    const f = this.compare;
    let h;
    for (; ; )
      if (h = f(a.key, t), h > 0) {
        let c = a.left;
        if (c == null || (h = f(c.key, t), h > 0 && (a.left = c.right, c.right = a, a = c, c = a.left, c == null)))
          break;
        r == null ? n = a : r.left = a, r = a, a = c;
      } else if (h < 0) {
        let c = a.right;
        if (c == null || (h = f(c.key, t), h < 0 && (a.right = c.left, c.left = a, a = c, c = a.right, c == null)))
          break;
        i == null ? o = a : i.right = a, i = a, a = c;
      } else
        break;
    return i != null && (i.right = a.left, a.left = o), r != null && (r.left = a.right, a.right = n), this.root !== a && (this.root = a, this.splayCount++), h;
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
}, ze = class Le extends tr {
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
    const r = new Le(this.compare, this.validKey), n = this.modificationCount;
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
    const r = new Le(this.compare, this.validKey);
    for (const n of this)
      e.has(n) && r.add(n);
    return r;
  }
  difference(e) {
    const r = new Le(this.compare, this.validKey);
    for (const n of this)
      e.has(n) || r.add(n);
    return r;
  }
  union(e) {
    const r = this.clone();
    return r.addAll(e), r;
  }
  clone() {
    const e = new Le(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function r(i, o) {
      let a, f;
      do {
        if (a = i.left, f = i.right, a != null) {
          const h = new Pe(a.key);
          o.left = h, r(a, h);
        }
        if (f != null) {
          const h = new Pe(f.key);
          o.right = h, i = f, o = h;
        }
      } while (f != null);
    }
    const n = new Pe(e.key);
    return r(e, n), n;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new nr(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new rr(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, Ut = class {
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
}, rr = class extends Ut {
  getValue(t) {
    return t.key;
  }
}, nr = class extends Ut {
  getValue(t) {
    return [t.key, t.key];
  }
}, zt = (t) => () => t, ot = (t) => {
  const e = t ? (r, n) => n.minus(r).abs().isLessThanOrEqualTo(t) : zt(!1);
  return (r, n) => e(r, n) ? 0 : r.comparedTo(n);
};
function ir(t) {
  const e = t ? (r, n, i, o, a) => r.exponentiatedBy(2).isLessThanOrEqualTo(
    o.minus(n).exponentiatedBy(2).plus(a.minus(i).exponentiatedBy(2)).times(t)
  ) : zt(!1);
  return (r, n, i) => {
    const o = r.x, a = r.y, f = i.x, h = i.y, c = a.minus(h).times(n.x.minus(f)).minus(o.minus(f).times(n.y.minus(h)));
    return e(c, o, a, f, h) ? 0 : c.comparedTo(0);
  };
}
var sr = (t) => t, or = (t) => {
  if (t) {
    const e = new ze(ot(t)), r = new ze(ot(t)), n = (o, a) => a.addAndReturn(o), i = (o) => ({
      x: n(o.x, e),
      y: n(o.y, r)
    });
    return i({ x: new fe(0), y: new fe(0) }), i;
  }
  return sr;
}, lt = (t) => ({
  set: (e) => {
    pe = lt(e);
  },
  reset: () => lt(t),
  compare: ot(t),
  snap: or(t),
  orient: ir(t)
}), pe = lt(), Me = (t, e) => t.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(t.ur.x) && t.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(t.ur.y), ut = (t, e) => {
  if (e.ur.x.isLessThan(t.ll.x) || t.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(t.ll.y) || t.ur.y.isLessThan(e.ll.y))
    return null;
  const r = t.ll.x.isLessThan(e.ll.x) ? e.ll.x : t.ll.x, n = t.ur.x.isLessThan(e.ur.x) ? t.ur.x : e.ur.x, i = t.ll.y.isLessThan(e.ll.y) ? e.ll.y : t.ll.y, o = t.ur.y.isLessThan(e.ur.y) ? t.ur.y : e.ur.y;
  return { ll: { x: r, y: i }, ur: { x: n, y: o } };
}, He = (t, e) => t.x.times(e.y).minus(t.y.times(e.x)), Kt = (t, e) => t.x.times(e.x).plus(t.y.times(e.y)), Ke = (t) => Kt(t, t).sqrt(), lr = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return He(i, n).div(Ke(i)).div(Ke(n));
}, ur = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return Kt(i, n).div(Ke(i)).div(Ke(n));
}, dt = (t, e, r) => e.y.isZero() ? null : { x: t.x.plus(e.x.div(e.y).times(r.minus(t.y))), y: r }, mt = (t, e, r) => e.x.isZero() ? null : { x: r, y: t.y.plus(e.y.div(e.x).times(r.minus(t.x))) }, ar = (t, e, r, n) => {
  if (e.x.isZero()) return mt(r, n, t.x);
  if (n.x.isZero()) return mt(t, e, r.x);
  if (e.y.isZero()) return dt(r, n, t.y);
  if (n.y.isZero()) return dt(t, e, r.y);
  const i = He(e, n);
  if (i.isZero()) return null;
  const o = { x: r.x.minus(t.x), y: r.y.minus(t.y) }, a = He(o, e).div(i), f = He(o, n).div(i), h = t.x.plus(f.times(e.x)), c = r.x.plus(a.times(n.x)), E = t.y.plus(f.times(e.y)), m = r.y.plus(a.times(n.y)), S = h.plus(c).div(2), A = E.plus(m).div(2);
  return { x: S, y: A };
}, ae = class Vt {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, r) {
    const n = Vt.comparePoints(e.point, r.point);
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
        sine: lr(this.point, e.point, o.point),
        cosine: ur(this.point, e.point, o.point)
      });
    };
    return (i, o) => {
      r.has(i) || n(i), r.has(o) || n(o);
      const { sine: a, cosine: f } = r.get(i), { sine: h, cosine: c } = r.get(o);
      return a.isGreaterThanOrEqualTo(0) && h.isGreaterThanOrEqualTo(0) ? f.isLessThan(c) ? 1 : f.isGreaterThan(c) ? -1 : 0 : a.isLessThan(0) && h.isLessThan(0) ? f.isLessThan(c) ? -1 : f.isGreaterThan(c) ? 1 : 0 : h.isLessThan(a) ? -1 : h.isGreaterThan(a) ? 1 : 0;
    };
  }
}, fr = class at {
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
      let a = null, f = o.leftSE, h = o.rightSE;
      const c = [f], E = f.point, m = [];
      for (; a = f, f = h, c.push(f), f.point !== E; )
        for (; ; ) {
          const S = f.getAvailableLinkedEvents();
          if (S.length === 0) {
            const M = c[0].point, _ = c[c.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${M.x}, \${M.y}]. Last matching segment found ends at [\${_.x}, \${_.y}].\`
            );
          }
          if (S.length === 1) {
            h = S[0].otherSE;
            break;
          }
          let A = null;
          for (let M = 0, _ = m.length; M < _; M++)
            if (m[M].point === f.point) {
              A = M;
              break;
            }
          if (A !== null) {
            const M = m.splice(A)[0], _ = c.splice(M.index);
            _.unshift(_[0].otherSE), r.push(new at(_.reverse()));
            continue;
          }
          m.push({
            index: c.length,
            point: f.point
          });
          const T = f.getLeftmostComparator(a);
          h = S.sort(T)[0].otherSE;
          break;
        }
      r.push(new at(c));
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
    for (let c = 1, E = this.events.length - 1; c < E; c++) {
      const m = this.events[c].point, S = this.events[c + 1].point;
      pe.orient(m, e, S) !== 0 && (r.push(m), e = m);
    }
    if (r.length === 1) return null;
    const n = r[0], i = r[1];
    pe.orient(n, e, i) === 0 && r.shift(), r.push(r[0]);
    const o = this.isExteriorRing() ? 1 : -1, a = this.isExteriorRing() ? 0 : r.length - 1, f = this.isExteriorRing() ? r.length : -1, h = [];
    for (let c = a; c != f; c += o)
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
      const a = this.events[i];
      ae.compare(e, a) > 0 && (e = a);
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
}, wt = class {
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
}, cr = class {
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
        if (i.isExteriorRing()) e.push(new wt(i));
        else {
          const o = i.enclosingRing();
          o?.poly || e.push(new wt(o)), o?.poly?.addInterior(i);
        }
    }
    return e;
  }
}, hr = class {
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
        const f = n.getIntersection(e);
        if (f !== null && (e.isAnEndpoint(f) || (o = f), !n.isAnEndpoint(f))) {
          const h = this._splitSafely(n, f);
          for (let c = 0, E = h.length; c < E; c++)
            r.push(h[c]);
        }
      }
      let a = null;
      if (i) {
        const f = i.getIntersection(e);
        if (f !== null && (e.isAnEndpoint(f) || (a = f), !i.isAnEndpoint(f))) {
          const h = this._splitSafely(i, f);
          for (let c = 0, E = h.length; c < E; c++)
            r.push(h[c]);
        }
      }
      if (o !== null || a !== null) {
        let f = null;
        o === null ? f = a : a === null ? f = o : f = ae.comparePoints(
          o,
          a
        ) <= 0 ? o : a, this.queue.delete(e.rightSE), r.push(e.rightSE);
        const h = e.split(f);
        for (let c = 0, E = h.length; c < E; c++)
          r.push(h[c]);
      }
      r.length > 0 ? (this.tree.delete(e), r.push(t)) : (this.segments.push(e), e.prev = n);
    } else {
      if (n && i) {
        const o = n.getIntersection(i);
        if (o !== null) {
          if (!n.isAnEndpoint(o)) {
            const a = this._splitSafely(n, o);
            for (let f = 0, h = a.length; f < h; f++)
              r.push(a[f]);
          }
          if (!i.isAnEndpoint(o)) {
            const a = this._splitSafely(i, o);
            for (let f = 0, h = a.length; f < h; f++)
              r.push(a[f]);
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
}, pr = class {
  type;
  numMultiPolys;
  run(t, e, r) {
    Ae.type = t;
    const n = [new vt(e, !0)];
    for (let c = 0, E = r.length; c < E; c++)
      n.push(new vt(r[c], !1));
    if (Ae.numMultiPolys = n.length, Ae.type === "difference") {
      const c = n[0];
      let E = 1;
      for (; E < n.length; )
        ut(n[E].bbox, c.bbox) !== null ? E++ : n.splice(E, 1);
    }
    if (Ae.type === "intersection")
      for (let c = 0, E = n.length; c < E; c++) {
        const m = n[c];
        for (let S = c + 1, A = n.length; S < A; S++)
          if (ut(m.bbox, n[S].bbox) === null) return [];
      }
    const i = new ze(ae.compare);
    for (let c = 0, E = n.length; c < E; c++) {
      const m = n[c].getSweepEvents();
      for (let S = 0, A = m.length; S < A; S++)
        i.add(m[S]);
    }
    const o = new hr(i);
    let a = null;
    for (i.size != 0 && (a = i.first(), i.delete(a)); a; ) {
      const c = o.process(a);
      for (let E = 0, m = c.length; E < m; E++) {
        const S = c[E];
        S.consumedBy === void 0 && i.add(S);
      }
      i.size != 0 ? (a = i.first(), i.delete(a)) : a = null;
    }
    pe.reset();
    const f = fr.factory(o.segments);
    return new cr(f).getGeom();
  }
}, Ae = new pr(), ft = Ae, gr = 0, Ve = class De {
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
    const n = e.leftSE.point.x, i = r.leftSE.point.x, o = e.rightSE.point.x, a = r.rightSE.point.x;
    if (a.isLessThan(n)) return 1;
    if (o.isLessThan(i)) return -1;
    const f = e.leftSE.point.y, h = r.leftSE.point.y, c = e.rightSE.point.y, E = r.rightSE.point.y;
    if (n.isLessThan(i)) {
      if (h.isLessThan(f) && h.isLessThan(c)) return 1;
      if (h.isGreaterThan(f) && h.isGreaterThan(c)) return -1;
      const m = e.comparePoint(r.leftSE.point);
      if (m < 0) return 1;
      if (m > 0) return -1;
      const S = r.comparePoint(e.rightSE.point);
      return S !== 0 ? S : -1;
    }
    if (n.isGreaterThan(i)) {
      if (f.isLessThan(h) && f.isLessThan(E)) return -1;
      if (f.isGreaterThan(h) && f.isGreaterThan(E)) return 1;
      const m = r.comparePoint(e.leftSE.point);
      if (m !== 0) return m;
      const S = e.comparePoint(r.rightSE.point);
      return S < 0 ? 1 : S > 0 ? -1 : 1;
    }
    if (f.isLessThan(h)) return -1;
    if (f.isGreaterThan(h)) return 1;
    if (o.isLessThan(a)) {
      const m = r.comparePoint(e.rightSE.point);
      if (m !== 0) return m;
    }
    if (o.isGreaterThan(a)) {
      const m = e.comparePoint(r.rightSE.point);
      if (m < 0) return 1;
      if (m > 0) return -1;
    }
    if (!o.eq(a)) {
      const m = c.minus(f), S = o.minus(n), A = E.minus(h), T = a.minus(i);
      if (m.isGreaterThan(S) && A.isLessThan(T)) return 1;
      if (m.isLessThan(S) && A.isGreaterThan(T)) return -1;
    }
    return o.isGreaterThan(a) ? 1 : o.isLessThan(a) || c.isLessThan(E) ? -1 : c.isGreaterThan(E) ? 1 : e.id < r.id ? -1 : e.id > r.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, r, n, i) {
    this.id = ++gr, this.leftSE = e, e.segment = this, e.otherSE = r, this.rightSE = r, r.segment = this, r.otherSE = e, this.rings = n, this.windings = i;
  }
  static fromRing(e, r, n) {
    let i, o, a;
    const f = ae.comparePoints(e, r);
    if (f < 0)
      i = e, o = r, a = 1;
    else if (f > 0)
      i = r, o = e, a = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const h = new ae(i, !0), c = new ae(o, !1);
    return new De(h, c, [n], [a]);
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
    const r = this.bbox(), n = e.bbox(), i = ut(r, n);
    if (i === null) return null;
    const o = this.leftSE.point, a = this.rightSE.point, f = e.leftSE.point, h = e.rightSE.point, c = Me(r, f) && this.comparePoint(f) === 0, E = Me(n, o) && e.comparePoint(o) === 0, m = Me(r, h) && this.comparePoint(h) === 0, S = Me(n, a) && e.comparePoint(a) === 0;
    if (E && c)
      return S && !m ? a : !S && m ? h : null;
    if (E)
      return m && o.x.eq(h.x) && o.y.eq(h.y) ? null : o;
    if (c)
      return S && a.x.eq(f.x) && a.y.eq(f.y) ? null : f;
    if (S && m) return null;
    if (S) return a;
    if (m) return h;
    const A = ar(o, this.vector(), f, e.vector());
    return A === null || !Me(i, A) ? null : pe.snap(A);
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
    const r = [], n = e.events !== void 0, i = new ae(e, !0), o = new ae(e, !1), a = this.rightSE;
    this.replaceRightSE(o), r.push(o), r.push(i);
    const f = new De(
      i,
      a,
      this.rings.slice(),
      this.windings.slice()
    );
    return ae.comparePoints(f.leftSE.point, f.rightSE.point) > 0 && f.swapEvents(), ae.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), n && (i.checkForConsuming(), o.checkForConsuming()), r;
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
      for (let o = 0, a = n.rings.length; o < a; o++) {
        const f = n.rings[o], h = n.windings[o], c = r.rings.indexOf(f);
        c === -1 ? (r.rings.push(f), r.windings.push(h)) : r.windings[c] += h;
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
    for (let f = 0, h = this.rings.length; f < h; f++) {
      const c = this.rings[f], E = this.windings[f], m = r.indexOf(c);
      m === -1 ? (r.push(c), n.push(E)) : n[m] += E;
    }
    const o = [], a = [];
    for (let f = 0, h = r.length; f < h; f++) {
      if (n[f] === 0) continue;
      const c = r[f], E = c.poly;
      if (a.indexOf(E) === -1)
        if (c.isExterior) o.push(E);
        else {
          a.indexOf(E) === -1 && a.push(E);
          const m = o.indexOf(c.poly);
          m !== -1 && o.splice(m, 1);
        }
    }
    for (let f = 0, h = o.length; f < h; f++) {
      const c = o[f].multiPoly;
      i.indexOf(c) === -1 && i.push(c);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const e = this.beforeState().multiPolys, r = this.afterState().multiPolys;
    switch (ft.type) {
      case "union": {
        const n = e.length === 0, i = r.length === 0;
        this._isInResult = n !== i;
        break;
      }
      case "intersection": {
        let n, i;
        e.length < r.length ? (n = e.length, i = r.length) : (n = r.length, i = e.length), this._isInResult = i === ft.numMultiPolys && n < i;
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
}, xt = class {
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
    for (let o = 1, a = t.length; o < a; o++) {
      if (typeof t[o][0] != "number" || typeof t[o][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const f = pe.snap({ x: new fe(t[o][0]), y: new fe(t[o][1]) });
      f.x.eq(i.x) && f.y.eq(i.y) || (this.segments.push(Ve.fromRing(i, f, this)), f.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = f.x), f.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = f.y), f.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = f.x), f.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = f.y), i = f);
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
}, yr = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(t, e) {
    if (!Array.isArray(t))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new xt(t[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let r = 1, n = t.length; r < n; r++) {
      const i = new xt(t[r], this, !1);
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
}, vt = class {
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
      const i = new yr(t[r], this);
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
}, dr = (t, ...e) => ft.run("union", t, e);
pe.set;
var Q = 63710088e-1, mr = {
  centimeters: Q * 100,
  centimetres: Q * 100,
  degrees: 360 / (2 * Math.PI),
  feet: Q * 3.28084,
  inches: Q * 39.37,
  kilometers: Q / 1e3,
  kilometres: Q / 1e3,
  meters: Q,
  metres: Q,
  miles: Q / 1609.344,
  millimeters: Q * 1e3,
  millimetres: Q * 1e3,
  nauticalmiles: Q / 1852,
  radians: 1,
  yards: Q * 1.0936
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
  if (!Et(t[0]) || !Et(t[1]))
    throw new Error("coordinates must contain numbers");
  return ge({
    type: "Point",
    coordinates: t
  }, e, r);
}
function wr(t, e, r = {}) {
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
function bt(t, e, r = {}) {
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
function xr(t, e, r = {}) {
  return ge({
    type: "MultiPolygon",
    coordinates: t
  }, e, r);
}
function vr(t, e = "kilometers") {
  const r = mr[e];
  if (!r)
    throw new Error(e + " units is invalid");
  return t * r;
}
function Ie(t) {
  return t % 360 * Math.PI / 180;
}
function Et(t) {
  return !isNaN(t) && t !== null && !Array.isArray(t);
}
function br(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function Ne(t, e, r) {
  if (t !== null)
    for (var n, i, o, a, f, h, c, E = 0, m = 0, S, A = t.type, T = A === "FeatureCollection", M = A === "Feature", _ = T ? t.features.length : 1, L = 0; L < _; L++) {
      c = T ? (
        // @ts-expect-error: Known type conflict
        t.features[L].geometry
      ) : M ? (
        // @ts-expect-error: Known type conflict
        t.geometry
      ) : t, S = c ? c.type === "GeometryCollection" : !1, f = S ? c.geometries.length : 1;
      for (var d = 0; d < f; d++) {
        var R = 0, k = 0;
        if (a = S ? c.geometries[d] : c, a !== null) {
          h = a.coordinates;
          var I = a.type;
          switch (E = 0, I) {
            case null:
              break;
            case "Point":
              if (
                // @ts-expect-error: Known type conflict
                e(
                  h,
                  m,
                  L,
                  R,
                  k
                ) === !1
              )
                return !1;
              m++, R++;
              break;
            case "LineString":
            case "MultiPoint":
              for (n = 0; n < h.length; n++) {
                if (
                  // @ts-expect-error: Known type conflict
                  e(
                    h[n],
                    m,
                    L,
                    R,
                    k
                  ) === !1
                )
                  return !1;
                m++, I === "MultiPoint" && R++;
              }
              I === "LineString" && R++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (n = 0; n < h.length; n++) {
                for (i = 0; i < h[n].length - E; i++) {
                  if (
                    // @ts-expect-error: Known type conflict
                    e(
                      h[n][i],
                      m,
                      L,
                      R,
                      k
                    ) === !1
                  )
                    return !1;
                  m++;
                }
                I === "MultiLineString" && R++, I === "Polygon" && k++;
              }
              I === "Polygon" && R++;
              break;
            case "MultiPolygon":
              for (n = 0; n < h.length; n++) {
                for (k = 0, i = 0; i < h[n].length; i++) {
                  for (o = 0; o < h[n][i].length - E; o++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      e(
                        h[n][i][o],
                        m,
                        L,
                        R,
                        k
                      ) === !1
                    )
                      return !1;
                    m++;
                  }
                  k++;
                }
                R++;
              }
              break;
            case "GeometryCollection":
              for (n = 0; n < a.geometries.length; n++)
                if (
                  // @ts-expect-error: Known type conflict
                  Ne(a.geometries[n], e) === !1
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
function pt(t, e) {
  if (t.type === "Feature")
    e(t, 0);
  else if (t.type === "FeatureCollection")
    for (var r = 0; r < t.features.length && e(t.features[r], r) !== !1; r++)
      ;
}
function Je(t, e) {
  var r, n, i, o, a, f, h, c, E, m, S = 0, A = t.type === "FeatureCollection", T = t.type === "Feature", M = A ? t.features.length : 1;
  for (r = 0; r < M; r++) {
    for (f = A ? (
      // @ts-expect-error: Known type conflict
      t.features[r].geometry
    ) : T ? (
      // @ts-expect-error: Known type conflict
      t.geometry
    ) : t, c = A ? (
      // @ts-expect-error: Known type conflict
      t.features[r].properties
    ) : T ? (
      // @ts-expect-error: Known type conflict
      t.properties
    ) : {}, E = A ? (
      // @ts-expect-error: Known type conflict
      t.features[r].bbox
    ) : T ? (
      // @ts-expect-error: Known type conflict
      t.bbox
    ) : void 0, m = A ? (
      // @ts-expect-error: Known type conflict
      t.features[r].id
    ) : T ? (
      // @ts-expect-error: Known type conflict
      t.id
    ) : void 0, h = f ? f.type === "GeometryCollection" : !1, a = h ? f.geometries.length : 1, i = 0; i < a; i++) {
      if (o = h ? f.geometries[i] : f, o === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            S,
            c,
            E,
            m
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
              E,
              m
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
                E,
                m
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
function Er(t, e, r) {
  var n = r;
  return Je(
    t,
    function(i, o, a, f, h) {
      n = e(
        // @ts-expect-error: Known type conflict
        n,
        i,
        o,
        a,
        f,
        h
      );
    }
  ), n;
}
function Sr(t, e) {
  Je(t, function(r, n, i, o, a) {
    var f = r === null ? null : r.type;
    switch (f) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            ge(r, i, { bbox: o, id: a }),
            n,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var h;
    switch (f) {
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
      var E = r.coordinates[c], m = {
        type: h,
        coordinates: E
      };
      if (
        // @ts-expect-error: Known type conflict
        e(ge(m, i), n, c) === !1
      )
        return !1;
    }
  });
}
function Pr(t, e = {}) {
  const r = [];
  if (Je(t, (i) => {
    r.push(i.coordinates);
  }), r.length < 2)
    throw new Error("Must have at least 2 geometries");
  const n = dr(r[0], ...r.slice(1));
  return n.length === 0 ? null : n.length === 1 ? wr(n[0], e.properties) : xr(n, e.properties);
}
function Mr(t) {
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
  return pt(t, (r) => {
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
  return Sr(t, function(r) {
    e.push(r);
  }), Ee(e);
}
class _r {
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
      const o = e - 1 >> 1, a = r[o];
      if (n(i, a) >= 0) break;
      r[e] = a, e = o;
    }
    r[e] = i;
  }
  _down(e) {
    const { data: r, compare: n } = this, i = this.length >> 1, o = r[e];
    for (; e < i; ) {
      let a = (e << 1) + 1;
      const f = a + 1;
      if (f < this.length && n(r[f], r[a]) < 0 && (a = f), n(r[a], o) >= 0) break;
      r[e] = r[a], e = a;
    }
    r[e] = o;
  }
}
function Lr(t, e = 1, r = !1) {
  let n = 1 / 0, i = 1 / 0, o = -1 / 0, a = -1 / 0;
  for (const [L, d] of t[0])
    L < n && (n = L), d < i && (i = d), L > o && (o = L), d > a && (a = d);
  const f = o - n, h = a - i, c = Math.max(e, Math.min(f, h));
  if (c === e) {
    const L = [n, i];
    return L.distance = 0, L;
  }
  const E = new _r([], (L, d) => d.max - L.max);
  let m = Or(t);
  const S = new $e(n + f / 2, i + h / 2, 0, t);
  S.d > m.d && (m = S);
  let A = 2;
  function T(L, d, R) {
    const k = new $e(L, d, R, t);
    A++, k.max > m.d + e && E.push(k), k.d > m.d && (m = k, r && console.log(\`found best \${Math.round(1e4 * k.d) / 1e4} after \${A} probes\`));
  }
  let M = c / 2;
  for (let L = n; L < o; L += c)
    for (let d = i; d < a; d += c)
      T(L + M, d + M, M);
  for (; E.length; ) {
    const { max: L, x: d, y: R, h: k } = E.pop();
    if (L - m.d <= e) break;
    M = k / 2, T(d - M, R - M, M), T(d + M, R - M, M), T(d - M, R + M, M), T(d + M, R + M, M);
  }
  r && console.log(\`num probes: \${A}
best distance: \${m.d}\`);
  const _ = [m.x, m.y];
  return _.distance = m.d, _;
}
function $e(t, e, r, n) {
  this.x = t, this.y = e, this.h = r, this.d = Ar(t, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function Ar(t, e, r) {
  let n = !1, i = 1 / 0;
  for (const o of r)
    for (let a = 0, f = o.length, h = f - 1; a < f; h = a++) {
      const c = o[a], E = o[h];
      c[1] > e != E[1] > e && t < (E[0] - c[0]) * (e - c[1]) / (E[1] - c[1]) + c[0] && (n = !n), i = Math.min(i, Nr(t, e, c, E));
    }
  return i === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(i);
}
function Or(t) {
  let e = 0, r = 0, n = 0;
  const i = t[0];
  for (let a = 0, f = i.length, h = f - 1; a < f; h = a++) {
    const c = i[a], E = i[h], m = c[0] * E[1] - E[0] * c[1];
    r += (c[0] + E[0]) * m, n += (c[1] + E[1]) * m, e += m * 3;
  }
  const o = new $e(r / e, n / e, 0, t);
  return e === 0 || o.d < 0 ? new $e(i[0][0], i[0][1], 0, t) : o;
}
function Nr(t, e, r, n) {
  let i = r[0], o = r[1], a = n[0] - i, f = n[1] - o;
  if (a !== 0 || f !== 0) {
    const h = ((t - i) * a + (e - o) * f) / (a * a + f * f);
    h > 1 ? (i = n[0], o = n[1]) : h > 0 && (i += a * h, o += f * h);
  }
  return a = t - i, f = e - o, a * a + f * f;
}
function Tr(t) {
  const e = [];
  return t.type === "FeatureCollection" ? pt(t, function(r) {
    Ne(r, function(n) {
      e.push(Oe(n, r.properties));
    });
  }) : t.type === "Feature" ? Ne(t, function(r) {
    e.push(Oe(r, t.properties));
  }) : Ne(t, function(r) {
    e.push(Oe(r));
  }), Ee(e);
}
function Cr(t, e = {}) {
  if (t.bbox != null && e.recompute !== !0)
    return t.bbox;
  const r = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return Ne(t, (n) => {
    r[0] > n[0] && (r[0] = n[0]), r[1] > n[1] && (r[1] = n[1]), r[2] < n[0] && (r[2] = n[0]), r[3] < n[1] && (r[3] = n[1]);
  }), r;
}
function Rr(t, e = {}) {
  const r = Cr(t), n = (r[0] + r[2]) / 2, i = (r[1] + r[3]) / 2;
  return Oe([n, i], e.properties, e);
}
function $t(t) {
  if (!t)
    throw new Error("geojson is required");
  switch (t.type) {
    case "Feature":
      return Xt(t);
    case "FeatureCollection":
      return kr(t);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return gt(t);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function Xt(t) {
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
  }), e.properties = Yt(t.properties), t.geometry == null ? e.geometry = null : e.geometry = gt(t.geometry), e;
}
function Yt(t) {
  const e = {};
  return t && Object.keys(t).forEach((r) => {
    const n = t[r];
    typeof n == "object" ? n === null ? e[r] = null : Array.isArray(n) ? e[r] = n.map((i) => i) : e[r] = Yt(n) : e[r] = n;
  }), e;
}
function kr(t) {
  const e = { type: "FeatureCollection" };
  return Object.keys(t).forEach((r) => {
    switch (r) {
      case "type":
      case "features":
        return;
      default:
        e[r] = t[r];
    }
  }), e.features = t.features.map((r) => Xt(r)), e;
}
function gt(t) {
  const e = { type: t.type };
  return t.bbox && (e.bbox = t.bbox), t.type === "GeometryCollection" ? (e.geometries = t.geometries.map((r) => gt(r)), e) : (e.coordinates = Jt(t.coordinates), e);
}
function Jt(t) {
  const e = t;
  return typeof e[0] != "object" ? e.slice() : e.map((r) => Jt(r));
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
function Fr(t) {
  return t.type === "Feature" ? t.geometry : t;
}
function Br(t, e) {
  return t.type === "FeatureCollection" ? "FeatureCollection" : t.type === "GeometryCollection" ? "GeometryCollection" : t.type === "Feature" && t.geometry !== null ? t.geometry.type : t.type;
}
function Ir(t, e, r = {}) {
  var n = Xe(t), i = Xe(e), o = Ie(i[1] - n[1]), a = Ie(i[0] - n[0]), f = Ie(n[1]), h = Ie(i[1]), c = Math.pow(Math.sin(o / 2), 2) + Math.pow(Math.sin(a / 2), 2) * Math.cos(f) * Math.cos(h);
  return vr(
    2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c)),
    r.units
  );
}
var Gr = Object.defineProperty, qr = Object.defineProperties, Hr = Object.getOwnPropertyDescriptors, St = Object.getOwnPropertySymbols, Dr = Object.prototype.hasOwnProperty, Ur = Object.prototype.propertyIsEnumerable, Pt = (t, e, r) => e in t ? Gr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, Mt = (t, e) => {
  for (var r in e || (e = {}))
    Dr.call(e, r) && Pt(t, r, e[r]);
  if (St)
    for (var r of St(e))
      Ur.call(e, r) && Pt(t, r, e[r]);
  return t;
}, _t = (t, e) => qr(t, Hr(e));
function zr(t, e, r = {}) {
  if (!t) throw new Error("targetPoint is required");
  if (!e) throw new Error("points is required");
  let n = 1 / 0, i = 0;
  pt(e, (a, f) => {
    const h = Ir(t, a, r);
    h < n && (i = f, n = h);
  });
  const o = $t(e.features[i]);
  return _t(Mt({}, o), {
    properties: _t(Mt({}, o.properties), {
      featureIndex: i,
      distanceToPoint: n
    })
  });
}
const he = 11102230246251565e-32, J = 134217729, Kr = (3 + 8 * he) * he;
function tt(t, e, r, n, i) {
  let o, a, f, h, c = e[0], E = n[0], m = 0, S = 0;
  E > c == E > -c ? (o = c, c = e[++m]) : (o = E, E = n[++S]);
  let A = 0;
  if (m < t && S < r)
    for (E > c == E > -c ? (a = c + o, f = o - (a - c), c = e[++m]) : (a = E + o, f = o - (a - E), E = n[++S]), o = a, f !== 0 && (i[A++] = f); m < t && S < r; )
      E > c == E > -c ? (a = o + c, h = a - o, f = o - (a - h) + (c - h), c = e[++m]) : (a = o + E, h = a - o, f = o - (a - h) + (E - h), E = n[++S]), o = a, f !== 0 && (i[A++] = f);
  for (; m < t; )
    a = o + c, h = a - o, f = o - (a - h) + (c - h), c = e[++m], o = a, f !== 0 && (i[A++] = f);
  for (; S < r; )
    a = o + E, h = a - o, f = o - (a - h) + (E - h), E = n[++S], o = a, f !== 0 && (i[A++] = f);
  return (o !== 0 || A === 0) && (i[A++] = o), A;
}
function Vr(t, e) {
  let r = e[0];
  for (let n = 1; n < t; n++) r += e[n];
  return r;
}
function Re(t) {
  return new Float64Array(t);
}
const $r = (3 + 16 * he) * he, Xr = (2 + 12 * he) * he, Yr = (9 + 64 * he) * he * he, we = Re(4), Lt = Re(8), At = Re(12), Ot = Re(16), W = Re(4);
function Jr(t, e, r, n, i, o, a) {
  let f, h, c, E, m, S, A, T, M, _, L, d, R, k, I, O, C, s;
  const u = t - i, l = r - i, p = e - o, g = n - o;
  k = u * g, S = J * u, A = S - (S - u), T = u - A, S = J * g, M = S - (S - g), _ = g - M, I = T * _ - (k - A * M - T * M - A * _), O = p * l, S = J * p, A = S - (S - p), T = p - A, S = J * l, M = S - (S - l), _ = l - M, C = T * _ - (O - A * M - T * M - A * _), L = I - C, m = I - L, we[0] = I - (L + m) + (m - C), d = k + L, m = d - k, R = k - (d - m) + (L - m), L = R - O, m = R - L, we[1] = R - (L + m) + (m - O), s = d + L, m = s - d, we[2] = d - (s - m) + (L - m), we[3] = s;
  let w = Vr(4, we), v = Xr * a;
  if (w >= v || -w >= v || (m = t - u, f = t - (u + m) + (m - i), m = r - l, c = r - (l + m) + (m - i), m = e - p, h = e - (p + m) + (m - o), m = n - g, E = n - (g + m) + (m - o), f === 0 && h === 0 && c === 0 && E === 0) || (v = Yr * a + Kr * Math.abs(w), w += u * E + g * f - (p * c + l * h), w >= v || -w >= v)) return w;
  k = f * g, S = J * f, A = S - (S - f), T = f - A, S = J * g, M = S - (S - g), _ = g - M, I = T * _ - (k - A * M - T * M - A * _), O = h * l, S = J * h, A = S - (S - h), T = h - A, S = J * l, M = S - (S - l), _ = l - M, C = T * _ - (O - A * M - T * M - A * _), L = I - C, m = I - L, W[0] = I - (L + m) + (m - C), d = k + L, m = d - k, R = k - (d - m) + (L - m), L = R - O, m = R - L, W[1] = R - (L + m) + (m - O), s = d + L, m = s - d, W[2] = d - (s - m) + (L - m), W[3] = s;
  const y = tt(4, we, 4, W, Lt);
  k = u * E, S = J * u, A = S - (S - u), T = u - A, S = J * E, M = S - (S - E), _ = E - M, I = T * _ - (k - A * M - T * M - A * _), O = p * c, S = J * p, A = S - (S - p), T = p - A, S = J * c, M = S - (S - c), _ = c - M, C = T * _ - (O - A * M - T * M - A * _), L = I - C, m = I - L, W[0] = I - (L + m) + (m - C), d = k + L, m = d - k, R = k - (d - m) + (L - m), L = R - O, m = R - L, W[1] = R - (L + m) + (m - O), s = d + L, m = s - d, W[2] = d - (s - m) + (L - m), W[3] = s;
  const x = tt(y, Lt, 4, W, At);
  k = f * E, S = J * f, A = S - (S - f), T = f - A, S = J * E, M = S - (S - E), _ = E - M, I = T * _ - (k - A * M - T * M - A * _), O = h * c, S = J * h, A = S - (S - h), T = h - A, S = J * c, M = S - (S - c), _ = c - M, C = T * _ - (O - A * M - T * M - A * _), L = I - C, m = I - L, W[0] = I - (L + m) + (m - C), d = k + L, m = d - k, R = k - (d - m) + (L - m), L = R - O, m = R - L, W[1] = R - (L + m) + (m - O), s = d + L, m = s - d, W[2] = d - (s - m) + (L - m), W[3] = s;
  const P = tt(x, At, 4, W, Ot);
  return Ot[P - 1];
}
function Zr(t, e, r, n, i, o) {
  const a = (e - o) * (r - i), f = (t - i) * (n - o), h = a - f, c = Math.abs(a + f);
  return Math.abs(h) >= $r * c ? h : -Jr(t, e, r, n, i, o, c);
}
function Wr(t, e) {
  var r, n, i = 0, o, a, f, h, c, E, m, S = t[0], A = t[1], T = e.length;
  for (r = 0; r < T; r++) {
    n = 0;
    var M = e[r], _ = M.length - 1;
    if (E = M[0], E[0] !== M[_][0] && E[1] !== M[_][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (a = E[0] - S, f = E[1] - A, n; n < _; n++) {
      if (m = M[n + 1], h = m[0] - S, c = m[1] - A, f === 0 && c === 0) {
        if (h <= 0 && a >= 0 || a <= 0 && h >= 0)
          return 0;
      } else if (c >= 0 && f <= 0 || c <= 0 && f >= 0) {
        if (o = Zr(a, h, f, c, 0, 0), o === 0)
          return 0;
        (o > 0 && c > 0 && f <= 0 || o < 0 && c <= 0 && f > 0) && i++;
      }
      E = m, f = c, a = h;
    }
  }
  return i % 2 !== 0;
}
function Qr(t, e, r = {}) {
  if (!t)
    throw new Error("point is required");
  if (!e)
    throw new Error("polygon is required");
  const n = Xe(t), i = Fr(e), o = i.type, a = e.bbox;
  let f = i.coordinates;
  if (a && jr(n, a) === !1)
    return !1;
  o === "Polygon" && (f = [f]);
  let h = !1;
  for (var c = 0; c < f.length; ++c) {
    const E = Wr(n, f[c]);
    if (E === 0) return !r.ignoreBoundary;
    E && (h = !0);
  }
  return h;
}
function jr(t, e) {
  return e[0] <= t[0] && e[1] <= t[1] && e[2] >= t[0] && e[3] >= t[1];
}
function Nt(t) {
  const e = en(t), r = Rr(e);
  let n = !1, i = 0;
  for (; !n && i < e.features.length; ) {
    const o = e.features[i].geometry;
    let a, f, h, c, E, m, S = !1;
    if (o.type === "Point")
      r.geometry.coordinates[0] === o.coordinates[0] && r.geometry.coordinates[1] === o.coordinates[1] && (n = !0);
    else if (o.type === "MultiPoint") {
      let A = !1, T = 0;
      for (; !A && T < o.coordinates.length; )
        r.geometry.coordinates[0] === o.coordinates[T][0] && r.geometry.coordinates[1] === o.coordinates[T][1] && (n = !0, A = !0), T++;
    } else if (o.type === "LineString") {
      let A = 0;
      for (; !S && A < o.coordinates.length - 1; )
        a = r.geometry.coordinates[0], f = r.geometry.coordinates[1], h = o.coordinates[A][0], c = o.coordinates[A][1], E = o.coordinates[A + 1][0], m = o.coordinates[A + 1][1], Tt(a, f, h, c, E, m) && (S = !0, n = !0), A++;
    } else if (o.type === "MultiLineString") {
      let A = 0;
      for (; A < o.coordinates.length; ) {
        S = !1;
        let T = 0;
        const M = o.coordinates[A];
        for (; !S && T < M.length - 1; )
          a = r.geometry.coordinates[0], f = r.geometry.coordinates[1], h = M[T][0], c = M[T][1], E = M[T + 1][0], m = M[T + 1][1], Tt(a, f, h, c, E, m) && (S = !0, n = !0), T++;
        A++;
      }
    } else (o.type === "Polygon" || o.type === "MultiPolygon") && Qr(r, o) && (n = !0);
    i++;
  }
  if (n)
    return r;
  {
    const o = Ee([]);
    for (let a = 0; a < e.features.length; a++)
      o.features = o.features.concat(
        Tr(e.features[a]).features
      );
    return Oe(zr(r, o).geometry.coordinates);
  }
}
function en(t) {
  return t.type !== "FeatureCollection" ? t.type !== "Feature" ? Ee([ge(t)]) : Ee([t]) : t;
}
function Tt(t, e, r, n, i, o) {
  const a = Math.sqrt((i - r) * (i - r) + (o - n) * (o - n)), f = Math.sqrt((t - r) * (t - r) + (e - n) * (e - n)), h = Math.sqrt((i - t) * (i - t) + (o - e) * (o - e));
  return a === f + h;
}
function Ct(t, e, r = {}) {
  const n = Xe(t), i = Te(e);
  for (let o = 0; o < i.length - 1; o++) {
    let a = !1;
    if (r.ignoreEndVertices && (o === 0 && (a = "start"), o === i.length - 2 && (a = "end"), o === 0 && o + 1 === i.length - 1 && (a = "both")), tn(
      i[o],
      i[o + 1],
      n,
      a,
      typeof r.epsilon > "u" ? null : r.epsilon
    ))
      return !0;
  }
  return !1;
}
function tn(t, e, r, n, i) {
  const o = r[0], a = r[1], f = t[0], h = t[1], c = e[0], E = e[1], m = r[0] - f, S = r[1] - h, A = c - f, T = E - h, M = m * T - S * A;
  if (i !== null) {
    if (Math.abs(M) > i)
      return !1;
  } else if (M !== 0)
    return !1;
  if (Math.abs(A) === Math.abs(T) && Math.abs(A) === 0)
    return n ? !1 : r[0] === t[0] && r[1] === t[1];
  if (n) {
    if (n === "start")
      return Math.abs(A) >= Math.abs(T) ? A > 0 ? f < o && o <= c : c <= o && o < f : T > 0 ? h < a && a <= E : E <= a && a < h;
    if (n === "end")
      return Math.abs(A) >= Math.abs(T) ? A > 0 ? f <= o && o < c : c < o && o <= f : T > 0 ? h <= a && a < E : E < a && a <= h;
    if (n === "both")
      return Math.abs(A) >= Math.abs(T) ? A > 0 ? f < o && o < c : c < o && o < f : T > 0 ? h < a && a < E : E < a && a < h;
  } else return Math.abs(A) >= Math.abs(T) ? A > 0 ? f <= o && o <= c : c <= o && o <= f : T > 0 ? h <= a && a <= E : E <= a && a <= h;
  return !1;
}
function rn(t, e = {}) {
  var r = typeof e == "object" ? e.mutate : e;
  if (!t) throw new Error("geojson is required");
  var n = Br(t), i = [];
  switch (n) {
    case "LineString":
      i = rt(t, n);
      break;
    case "MultiLineString":
    case "Polygon":
      Te(t).forEach(function(a) {
        i.push(rt(a, n));
      });
      break;
    case "MultiPolygon":
      Te(t).forEach(function(a) {
        var f = [];
        a.forEach(function(h) {
          f.push(rt(h, n));
        }), i.push(f);
      });
      break;
    case "Point":
      return t;
    case "MultiPoint":
      var o = {};
      Te(t).forEach(function(a) {
        var f = a.join("-");
        Object.prototype.hasOwnProperty.call(o, f) || (i.push(a), o[f] = !0);
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
function rt(t, e) {
  const r = Te(t);
  if (r.length === 2 && !Rt(r[0], r[1])) return r;
  const n = [];
  let i = 0, o = 1, a = 2;
  for (n.push(r[i]); a < r.length; )
    Ct(r[o], bt([r[i], r[a]])) ? o = a : (n.push(r[o]), i = o, o++, a = o), a++;
  if (n.push(r[o]), e === "Polygon" || e === "MultiPolygon") {
    if (Ct(
      n[0],
      bt([n[1], n[n.length - 2]])
    ) && (n.shift(), n.pop(), n.push(n[0])), n.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!Rt(n[0], n[n.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return n;
}
function Rt(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}
function nn(t, e) {
  var r = t[0] - e[0], n = t[1] - e[1];
  return r * r + n * n;
}
function sn(t, e, r) {
  var n = e[0], i = e[1], o = r[0] - n, a = r[1] - i;
  if (o !== 0 || a !== 0) {
    var f = ((t[0] - n) * o + (t[1] - i) * a) / (o * o + a * a);
    f > 1 ? (n = r[0], i = r[1]) : f > 0 && (n += o * f, i += a * f);
  }
  return o = t[0] - n, a = t[1] - i, o * o + a * a;
}
function on(t, e) {
  for (var r = t[0], n = [r], i, o = 1, a = t.length; o < a; o++)
    i = t[o], nn(i, r) > e && (n.push(i), r = i);
  return r !== i && n.push(i), n;
}
function ct(t, e, r, n, i) {
  for (var o = n, a, f = e + 1; f < r; f++) {
    var h = sn(t[f], t[e], t[r]);
    h > o && (a = f, o = h);
  }
  o > n && (a - e > 1 && ct(t, e, a, n, i), i.push(t[a]), r - a > 1 && ct(t, a, r, n, i));
}
function ln(t, e) {
  var r = t.length - 1, n = [t[0]];
  return ct(t, 0, r, e, n), n.push(t[r]), n;
}
function Ye(t, e, r) {
  if (t.length <= 2) return t;
  var n = e !== void 0 ? e * e : 1;
  return t = r ? t : on(t, n), t = ln(t, n), t;
}
function kt(t, e = {}) {
  var r, n, i;
  if (e = e ?? {}, !br(e)) throw new Error("options is invalid");
  const o = (r = e.tolerance) != null ? r : 1, a = (n = e.highQuality) != null ? n : !1, f = (i = e.mutate) != null ? i : !1;
  if (!t) throw new Error("geojson is required");
  if (o && o < 0) throw new Error("invalid tolerance");
  return f !== !0 && (t = $t(t)), Je(t, function(h) {
    un(h, o, a);
  }), t;
}
function un(t, e, r) {
  const n = t.type;
  if (n === "Point" || n === "MultiPoint") return t;
  if (rn(t, { mutate: !0 }), n !== "GeometryCollection")
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
        t.coordinates = Ft(
          t.coordinates,
          e,
          r
        );
        break;
      case "MultiPolygon":
        t.coordinates = t.coordinates.map(
          (i) => Ft(i, e, r)
        );
    }
  return t;
}
function Ft(t, e, r) {
  return t.map(function(n) {
    if (n.length < 4)
      throw new Error("invalid polygon");
    let i = e, o = Ye(n, i, r);
    for (; !Bt(o) && i >= Number.EPSILON; )
      i -= i * 0.01, o = Ye(n, i, r);
    return Bt(o) ? ((o[o.length - 1][0] !== o[0][0] || o[o.length - 1][1] !== o[0][1]) && o.push(o[0]), o) : n;
  });
}
function Bt(t) {
  return t.length < 3 ? !1 : !(t.length === 3 && t[2][0] === t[0][0] && t[2][1] === t[0][1]);
}
function an(t) {
  return Er(
    t,
    (e, r) => e + fn(r),
    0
  );
}
function fn(t) {
  let e = 0, r;
  switch (t.type) {
    case "Polygon":
      return It(t.coordinates);
    case "MultiPolygon":
      for (r = 0; r < t.coordinates.length; r++)
        e += It(t.coordinates[r]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function It(t) {
  let e = 0;
  if (t && t.length > 0) {
    e += Math.abs(Gt(t[0]));
    for (let r = 1; r < t.length; r++)
      e -= Math.abs(Gt(t[r]));
  }
  return e;
}
var cn = Q * Q / 2, nt = Math.PI / 180;
function Gt(t) {
  const e = t.length - 1;
  if (e <= 2) return 0;
  let r = 0, n = 0;
  for (; n < e; ) {
    const i = t[n], o = t[n + 1 === e ? 0 : n + 1], a = t[n + 2 >= e ? (n + 2) % e : n + 2], f = i[0] * nt, h = o[1] * nt, c = a[0] * nt;
    r += (c - f) * Math.sin(h), n++;
  }
  return r * cn;
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
const Ce = new TextEncoder(), Zt = new TextDecoder(), ve = { keys: [], index: /* @__PURE__ */ new Map() }, hn = 2e3;
function pn() {
  ve.keys = [], ve.index = /* @__PURE__ */ new Map();
}
let ue = !1;
function qe(t, e = {}) {
  const r = [], n = [], i = [], o = /* @__PURE__ */ new Map(), a = !!e.useSharedKeyTable;
  let f, h;
  a ? (f = ve.keys, h = ve.index) : (f = [], h = /* @__PURE__ */ new Map());
  let c = 0, E = 0;
  const m = (_) => {
    if (Array.isArray(_)) {
      const L = Number(_[0]), d = Number(_[1]);
      n.push(Number.isFinite(L) ? L : 0, Number.isFinite(d) ? d : 0);
    } else if (_ && (typeof _.x == "number" || typeof _.y == "number")) {
      const L = Number(_.x), d = Number(_.y);
      n.push(Number.isFinite(L) ? L : 0, Number.isFinite(d) ? d : 0);
    } else
      n.push(0, 0);
  };
  for (const _ of t) {
    const L = _.id == null ? "" : String(_.id), d = _.geometry || {}, R = d.type || "Unknown", k = { id: L, type: R, coordsOffset: c, coordsLength: 0 };
    if (R === "Point") {
      const C = d.coordinates || [];
      m(C), k.coordsLength = 2;
    } else if (R === "LineString" || R === "MultiPoint") {
      const C = d.coordinates || [];
      for (const s of C) m(s);
      k.coordsLength = (C.length || 0) * 2;
    } else if (R === "Polygon") {
      const C = d.coordinates || [];
      k.ringLengths = [];
      for (const s of C) {
        k.ringLengths.push(s.length || 0);
        for (const u of s) m(u);
      }
      k.coordsLength = k.ringLengths.reduce((s, u) => s + u, 0) * 2;
    } else if (R === "MultiPolygon") {
      const C = d.coordinates || [];
      k.polygonRingCounts = [], k.ringLengths = [];
      for (const s of C) {
        k.polygonRingCounts.push(s.length || 0);
        for (const u of s) {
          k.ringLengths.push(u.length || 0);
          for (const l of u) m(l);
        }
      }
      k.coordsLength = k.ringLengths.reduce((s, u) => s + u, 0) * 2;
    } else
      k.coordsLength = 0;
    const I = _.properties || {}, O = [];
    for (const C of Object.keys(I)) {
      let s = h.get(C);
      s === void 0 && (s = f.length, f.push(C), h.set(C, s), a && f.length > hn && (pn(), f = ve.keys, h = ve.index));
      const u = I[C];
      let l;
      if (u === null || typeof u == "string" || typeof u == "number" || typeof u == "boolean") {
        const p = typeof u + "|" + String(u);
        if (l = o.get(p), !l) {
          const g = JSON.stringify(u);
          l = Ce.encode(g), o.set(p, l);
        }
      } else {
        const p = JSON.stringify(u);
        l = Ce.encode(p);
      }
      i.push(l), O.push([s, E, l.length]), E += l.length;
    }
    k.props = O, c += k.coordsLength, r.push(k);
  }
  let S;
  if (e.propsBuffer)
    e.propsBuffer instanceof Uint8Array ? S = e.propsBuffer.subarray(0, E) : S = new Uint8Array(e.propsBuffer, 0, E), S.byteLength < E && (S = new Uint8Array(E));
  else if (e.pool && E > 0) {
    const _ = e.pool.rent(E);
    S = new Uint8Array(_, 0, E);
  } else
    S = new Uint8Array(E);
  let A = 0;
  for (const _ of i)
    S.set(_, A), A += _.length;
  const T = n.length;
  let M;
  if (e.coordsBuffer)
    e.coordsBuffer instanceof ArrayBuffer ? M = new Float32Array(e.coordsBuffer, 0, T) : e.coordsBuffer instanceof Float32Array ? M = e.coordsBuffer.subarray(0, T) : M = new Float32Array(T), M.length < T && (M = new Float32Array(T));
  else if (e.pool && T > 0) {
    const _ = e.pool.rent(T * 4);
    M = new Float32Array(_, 0, T);
  } else
    M = new Float32Array(T);
  return M.length > 0 && M.set(n), { meta: r, keys: f, propsBuffer: S, coordsArray: M };
}
function gn(t, e, r, n) {
  const i = r instanceof Float32Array ? r : new Float32Array(r), o = e instanceof Uint8Array ? e : e ? new Uint8Array(e) : new Uint8Array(0), a = [];
  for (let f = 0; f < (t.length || 0); f++) {
    const h = t[f] || {}, c = h.id, E = {};
    if (Array.isArray(h.props) && h.props.length && n && n.length)
      for (const _ of h.props) {
        const [L, d, R] = _;
        try {
          const k = o.subarray(d, d + R);
          E[n[L]] = JSON.parse(Zt.decode(k));
        } catch {
        }
      }
    const m = h.type || "Unknown";
    let S = h.coordsOffset || 0;
    const A = S + (h.coordsLength || 0);
    let T = null;
    if (m === "Point") {
      const _ = i[S], L = i[S + 1], d = Number.isFinite(_) ? Math.max(-180, Math.min(180, _)) : 0, R = Number.isFinite(L) ? Math.max(-90, Math.min(90, L)) : 0;
      if ((!Number.isFinite(_) || !Number.isFinite(L)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value", { index: f, id: c, rawX: _, rawY: L });
        } catch {
        }
      }
      T = { type: "Point", coordinates: [d, R] };
    } else if (m === "LineString" || m === "MultiPoint") {
      const _ = [];
      for (; S < A; S += 2) {
        const L = i[S], d = i[S + 1], R = Number.isFinite(L) ? Math.max(-180, Math.min(180, L)) : 0, k = Number.isFinite(d) ? Math.max(-90, Math.min(90, d)) : 0;
        if ((!Number.isFinite(L) || !Number.isFinite(d)) && !ue) {
          ue = !0;
          try {
            console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value", { index: f, id: c, rawX: L, rawY: d });
          } catch {
          }
        }
        _.push([R, k]);
      }
      T = { type: m, coordinates: _ };
    } else if (m === "Polygon") {
      const _ = [], L = h.ringLengths || [];
      for (const d of L) {
        const R = [];
        for (let k = 0; k < d; k++) {
          const I = i[S], O = i[S + 1], C = Number.isFinite(I) ? Math.max(-180, Math.min(180, I)) : 0, s = Number.isFinite(O) ? Math.max(-90, Math.min(90, O)) : 0;
          if ((!Number.isFinite(I) || !Number.isFinite(O)) && !ue) {
            ue = !0;
            try {
              console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value", { index: f, id: c, rawX: I, rawY: O });
            } catch {
            }
          }
          R.push([C, s]), S += 2;
        }
        _.push(R);
      }
      T = { type: "Polygon", coordinates: _ };
    } else if (m === "MultiPolygon") {
      const _ = [], L = h.polygonRingCounts || [], d = h.ringLengths || [];
      let R = 0;
      for (const k of L) {
        const I = [];
        for (let O = 0; O < k; O++) {
          const C = d[R++] || 0, s = [];
          for (let u = 0; u < C; u++) {
            const l = i[S], p = i[S + 1], g = Number.isFinite(l) ? Math.max(-180, Math.min(180, l)) : 0, w = Number.isFinite(p) ? Math.max(-90, Math.min(90, p)) : 0;
            if ((!Number.isFinite(l) || !Number.isFinite(p)) && !ue) {
              ue = !0;
              try {
                console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value", { index: f, id: c, rawX: l, rawY: p });
              } catch {
              }
            }
            s.push([g, w]), S += 2;
          }
          I.push(s);
        }
        _.push(I);
      }
      T = { type: "MultiPolygon", coordinates: _ };
    } else if (S < A) {
      const _ = i[S], L = i[S + 1], d = Number.isFinite(_) ? Math.max(-180, Math.min(180, _)) : 0, R = Number.isFinite(L) ? Math.max(-90, Math.min(90, L)) : 0;
      if ((!Number.isFinite(_) || !Number.isFinite(L)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value", { index: f, id: c, rawX: _, rawY: L });
        } catch {
        }
      }
      T = { type: "Point", coordinates: [d, R] };
    }
    T == null && (T = { type: "Point", coordinates: [0, 0] });
    const M = E && typeof E == "object" ? E : {};
    a.push({ type: "Feature", id: c, geometry: T, properties: M });
  }
  return a;
}
const _e = new be(), U = /* @__PURE__ */ new Map();
let it = 1e4, me = null;
const yn = (t, e) => {
  try {
    const r = t && t.geometry && t.geometry.coordinates;
    let n = Lr(r, e);
    return (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1])) && (n = Nt(t).geometry.coordinates), {
      type: "Point",
      coordinates: [n[0], n[1]]
    };
  } catch {
    return console.log("Invalid feature geometry", t && t.id), Nt(t).geometry;
  }
}, qt = (t) => {
  if (!t) return 0;
  let e = 0;
  for (let r = 0; r < t.length; r++) {
    const n = (r + 1) % t.length;
    e += t[r][0] * t[n][1], e -= t[n][0] * t[r][1];
  }
  return Math.abs(e) / 2;
}, dn = (t, e) => {
  try {
    if (e === "meters")
      return an(t);
    {
      const r = t && t.geometry;
      if (!r || r.type !== "Polygon") return 0;
      const n = r && r.coordinates;
      let i = qt(n[0]);
      for (let o = 1; o < n.length; o++)
        i -= qt(n[o]);
      return i;
    }
  } catch (r) {
    return console.log("Error computing area for feature", t && t.id, r), 0;
  }
}, mn = new ArrayBuffer(8), st = new DataView(mn), wn = new ArrayBuffer(4), Ht = new DataView(wn);
function Wt() {
  return 2166136261;
}
function ie(t, e) {
  return t ^= e >>> 0, t = Math.imul(t, 16777619) >>> 0, t;
}
function xn(t, e) {
  const r = Number(e) || 0;
  return st.setFloat64(0, r, !0), t = ie(t, st.getUint32(0, !0)), t = ie(t, st.getUint32(4, !0)), t;
}
function oe(t, e) {
  const r = Number(e) || 0;
  return Ht.setFloat32(0, r, !0), t = ie(t, Ht.getUint32(0, !0)), t;
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
  let e = Wt();
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
        for (const a of o)
          e = oe(e, a && a[0]), e = oe(e, a && a[1]);
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
function Qt(t, e, r = 1e-6) {
  if (typeof t == "number" && typeof e == "number") return Math.abs(t - e) <= r;
  if (Array.isArray(t) && Array.isArray(e)) {
    if (t.length !== e.length) return !1;
    for (let n = 0; n < t.length; n++)
      if (!Qt(t[n], e[n], r)) return !1;
    return !0;
  }
  return !1;
}
function vn(t, e) {
  return !t && !e ? !0 : !t || !e || t.type !== e.type ? !1 : Qt(t.coordinates, e.coordinates);
}
function bn(t) {
  let e = Wt();
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
        i == null ? e = ie(e, 0) : typeof i == "number" ? e = xn(e, i) : e = Ue(e, String(i));
      }
  }
  return e;
}
const ht = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
try {
  ht.__test_setPendingDiff = (t) => {
    me = t;
  }, ht.__test_getCacheSize = () => U && typeof U.size == "number" ? U.size : 0;
} catch {
}
ht.onmessage = (t) => {
  let e = t && t.data;
  if (e && e.type === "diff_ack") {
    try {
      if (me) {
        for (const M of me.addList || []) {
          const _ = M && (M.feature || M);
          if (_ && _.id != null)
            try {
              const L = M && M.geomHash !== void 0 ? M.geomHash : xe(_.geometry), d = M && M.rawHash !== void 0 ? M.rawHash : L;
              U.set(String(_.id), { feature: _, geomHash: L, rawHash: d, ts: Date.now() });
            } catch {
              U.set(String(_.id), { feature: _, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const M of me.updateList || []) {
          const _ = M && (M.feature || M);
          if (_ && _.id != null)
            try {
              const L = M && M.geomHash !== void 0 ? M.geomHash : xe(_.geometry), d = M && M.rawHash !== void 0 ? M.rawHash : L;
              U.set(String(_.id), { feature: _, geomHash: L, rawHash: d, ts: Date.now() });
            } catch {
              U.set(String(_.id), { feature: _, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const M of me.removeList || [])
          try {
            U.delete(String(M));
          } catch {
          }
        for (; U.size > it; ) {
          const M = U.keys().next();
          if (M.done) break;
          U.delete(M.value);
        }
        me = null;
      }
    } catch {
    }
    return;
  }
  if (e && e.type === "request_full") {
    try {
      const M = Array.from(U.values()).map((k) => k.feature), { meta: _, keys: L, propsBuffer: d, coordsArray: R } = qe(M || [], { pool: _e, useSharedKeyTable: !0 });
      postMessage({ type: "geojson_bin", meta: _, keys: L, propsBuf: d.buffer, coords: R.buffer }, [d.buffer, R.buffer]);
    } catch {
    }
    return;
  }
  if (e && e.type === "features" && e.payload)
    try {
      const M = e.payload instanceof Uint8Array ? e.payload.buffer : e.payload, _ = Zt.decode(M);
      e = JSON.parse(_);
    } catch {
      e = {};
    }
  if (e && e.type === "features_bin" && e.coords)
    try {
      const M = e.meta || [], _ = e.propsBuf !== void 0 ? e.propsBuf : null, L = e.coords, d = e.keys || [], R = gn(M, _, L, d), k = t.data && t.data.hashes ? t.data.hashes : null;
      if (k && Array.isArray(R))
        for (const I of R)
          try {
            const O = String(I && I.id != null ? I.id : ""), C = k[O];
            C !== void 0 && (I.__inGeomHash = C);
          } catch {
          }
      e = { features: R, tolerance: t.data && t.data.tolerance, promoteId: t.data && t.data.promoteId, _receivedPropsBuf: _, _receivedCoordsBuf: L, _receivedKeys: d, _receivedHashes: k, cacheSize: t.data && t.data.cacheSize };
    } catch {
      e = e || {};
    }
  const r = e || {}, n = r.features || [], i = r.tolerance || 1e-5, o = r.unit || "meters", a = !0, f = /* @__PURE__ */ new Map();
  for (const M of n) {
    const _ = M.id, L = f.get(_) || [];
    L.push(M), f.set(_, L);
  }
  const h = { type: "FeatureCollection", features: [] }, c = [], E = [], m = /* @__PURE__ */ new Set(), S = [], A = /* @__PURE__ */ new Map();
  for (const [M, _] of f.entries()) {
    const L = String(M), d = bn(_), R = U.get(L);
    if (R && R.rawHash === d) {
      S.push(R.feature);
      continue;
    }
    const { clipped: k, ...I } = _[0] && _[0].properties || {};
    let O;
    if (_.length === 1) {
      const l = _[0].geometry;
      let p = { type: "Feature", id: M, geometry: l, properties: I };
      l.type === "MultiPolygon" ? O = Ge(p) : O = { type: "FeatureCollection", features: [p] }, O = kt(O, { tolerance: i, mutate: a });
    } else
      O = { type: "FeatureCollection", features: _.map((l) => ({ type: "Feature", id: M, geometry: l.geometry, properties: I })) }, O.features.some((l) => l.geometry.type === "MultiPolygon") && (O = Ge(O)), O = kt(O, { tolerance: i, mutate: a }), _.some((l) => l.properties && l.properties.clipped) && (O = Pr(O)), O.type === "Feature" ? O.geometry.type === "MultiPolygon" ? O = Ge(O) : O = { type: "FeatureCollection", features: [O] } : O.features.some((l) => l.geometry.type === "MultiPolygon") && (O = Ge(O));
    O.features = O.features.map((l, p) => {
      const g = \`\${M}-\${p}\`, w = l.geometry;
      if (w && w.type === "Polygon") {
        const v = dn(l, o);
        l.geometry = yn(l, i), l.properties = { ...I, _area: v, _index: g, _groupId: M };
      } else
        console.log("Unexpected geometry type after union/simplify/flatten for id:" + M + " - type:" + (w && w.type)), l.properties = { ...I, _area: 0, _index: g, _groupId: M };
      return l.id = g, l;
    });
    const C = Math.max(...O.features.map((l) => l.properties && l.properties._area || 0));
    O.features.map((l) => l._index), O.features.map((l) => (l.properties && l.properties._area != null && l.properties._area > 0 ? (l.properties._localSortKey = C / l.properties._area, l.properties._globalSortKey = 1 / l.properties._area) : (l.properties._localSortKey = 1 / 0, l.properties._globalSortKey = 1 / 0), l)), O = Mr(O);
    const s = { type: "Feature", id: M, geometry: O.features[0].geometry, properties: I }, u = xe(s.geometry);
    if (!R)
      c.push(s);
    else if (u !== (R.geomHash || 0))
      try {
        vn(s.geometry, R.feature.geometry) || (E.push(s), m.add(L));
      } catch {
        E.push(s), m.add(L);
      }
    A.set(L, { feature: s, rawHash: d, geomHash: u }), S.push(s);
  }
  const T = r.promoteId;
  if (T)
    for (const M of S)
      M.properties || (M.properties = {}), M.id != null && (M.properties[T] === void 0 || M.properties[T] === null) && (M.properties[T] = M.id);
  try {
    e && typeof e.cacheSize == "number" && e.cacheSize > 0 && (it = e.cacheSize);
    const M = S && S.length ? S : h.features || [];
    if (U.size === 0) {
      for (const [l, p] of A.entries())
        try {
          U.set(l, { feature: p.feature, geomHash: p.geomHash, rawHash: p.rawHash, ts: Date.now() });
        } catch {
          U.set(l, { feature: p.feature, geomHash: p.geomHash || 0, rawHash: p.rawHash || 0, ts: Date.now() });
        }
      const { meta: O, keys: C, propsBuffer: s, coordsArray: u } = qe(M || [], { pool: _e });
      postMessage({ type: "geojson_bin", meta: O, keys: C, propsBuf: s.buffer, coords: u.buffer }, [s.buffer, u.buffer]);
      return;
    }
    const _ = c.length;
    let L = Math.max(0, U.size + _ - it);
    const d = [];
    if (L > 0) {
      for (const O of U.keys()) {
        if (d.length >= L) break;
        if (m.has(O)) continue;
        const C = U.get(O);
        d.push(C && C.feature && C.feature.id != null ? C.feature.id : O);
      }
      if (d.length < L)
        for (const O of U.keys()) {
          if (d.length >= L) break;
          if (d.includes(O)) continue;
          const C = U.get(O);
          d.push(C && C.feature && C.feature.id != null ? C.feature.id : O);
        }
    }
    if (c.length === 0 && E.length === 0 && d.length === 0)
      return;
    const R = E.map((O) => {
      const C = { id: O.id };
      O.geometry && (C.newGeometry = O.geometry);
      const s = U.get(String(O.id)), u = s && s.feature && s.feature.properties ? s.feature.properties : {}, l = O.properties || {}, p = Object.keys(u), g = Object.keys(l);
      if (g.length === 0 && p.length > 0)
        C.removeAllProperties = !0;
      else {
        const v = p.filter((y) => !(y in l));
        v.length && (C.removeProperties = v);
      }
      const w = g.filter((v) => l[v] !== u[v]).map((v) => ({ key: v, value: l[v] }));
      return w.length && (C.addOrUpdateProperties = w), C;
    }), k = c.map((O) => {
      const C = A.get(String(O.id));
      if (C) return { feature: C.feature, rawHash: C.rawHash, geomHash: C.geomHash };
      try {
        const s = xe(O.geometry);
        return { feature: O, rawHash: s, geomHash: s };
      } catch {
        return { feature: O, rawHash: 0, geomHash: 0 };
      }
    }), I = E.map((O) => {
      const C = A.get(String(O.id));
      if (C) return { feature: C.feature, rawHash: C.rawHash, geomHash: C.geomHash };
      try {
        const s = xe(O.geometry);
        return { feature: O, rawHash: s, geomHash: s };
      } catch {
        return { feature: O, rawHash: 0, geomHash: 0 };
      }
    });
    me = { addList: k, updateList: I, removeList: d };
    try {
      const O = { type: "geojson_diff_bin" };
      d.length && (U.size > 0 && d.length >= U.size ? O.removeAll = !0 : O.removeList = d);
      const C = [];
      if (c.length) {
        const { meta: s, keys: u, propsBuffer: l, coordsArray: p } = qe(c || [], { pool: _e, useSharedKeyTable: !0 });
        O.add = { meta: s, keys: u, propsBuf: l.buffer, coords: p.buffer }, l && l.buffer && C.push(l.buffer), p && p.buffer && C.push(p.buffer);
      }
      if (E.length) {
        const { meta: s, keys: u, propsBuffer: l, coordsArray: p } = qe(E || [], { pool: _e, useSharedKeyTable: !0 });
        O.update = { meta: s, keys: u, propsBuf: l.buffer, coords: p.buffer }, l && l.buffer && C.push(l.buffer), p && p.buffer && C.push(p.buffer);
      }
      if (R.length) {
        const s = [], u = /* @__PURE__ */ new Map(), l = [];
        let p = 0;
        const g = /* @__PURE__ */ new Map(), w = R.map((y) => {
          const x = { id: y.id };
          return y.removeAllProperties && (x.removeAllProperties = !0), Array.isArray(y.removeProperties) && y.removeProperties.length && (x.removeProperties = y.removeProperties.map((P) => {
            let b = u.get(P);
            return b === void 0 && (b = s.length, s.push(P), u.set(P, b)), b;
          })), Array.isArray(y.addOrUpdateProperties) && y.addOrUpdateProperties.length && (x.addOrUpdate = y.addOrUpdateProperties.map((P) => {
            const b = P.key;
            let N = u.get(b);
            N === void 0 && (N = s.length, s.push(b), u.set(b, N));
            const F = P.value;
            let B;
            if (F === null || typeof F == "string" || typeof F == "number" || typeof F == "boolean") {
              const K = typeof F + "|" + String(F);
              if (B = g.get(K), !B) {
                const q = JSON.stringify(F);
                B = Ce.encode(q), g.set(K, B);
              }
            } else {
              const K = JSON.stringify(F);
              B = Ce.encode(K);
            }
            l.push(B);
            const H = p, z = B.length;
            return p += z, [N, H, z];
          })), x;
        });
        let v = null;
        if (p > 0) {
          const y = _e.rent(p);
          v = new Uint8Array(y, 0, p);
          let x = 0;
          for (const P of l)
            v.set(P, x), x += P.length;
        } else
          v = new Uint8Array(0);
        O.updateDiffsMeta = w, O.updateKeys = s, v && v.buffer && v.byteLength && (O.updatePropsBuf = v.buffer, C.push(v.buffer));
      }
      postMessage(O, C);
      return;
    } catch {
      try {
        const C = {};
        d.length && (U.size > 0 && d.length >= U.size ? C.removeAll = !0 : C.remove = d), c.length && (C.add = c), R.length && (C.update = R), postMessage({ type: "geojson_diff", diff: C });
        return;
      } catch {
      }
    }
    return;
  } catch {
    try {
      const _ = JSON.stringify(h), L = Ce.encode(_);
      postMessage({ type: "geojson", payload: L.buffer }, [L.buffer]);
    } catch {
      postMessage(h);
    }
  }
};
`,Ln=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",An],{type:"text/javascript;charset=utf-8"});function ce(r){let n;try{if(n=Ln&&(self.URL||self.webkitURL).createObjectURL(Ln),!n)throw"";const e=new Worker(n,{type:"module",name:r?.name});return e.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(n)}),e}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(An),{type:"module",name:r?.name})}}class j{constructor(){this.map=new Map}static _nextPow2(n){return n<=0?0:(n=n-1>>>0,n|=n>>1,n|=n>>2,n|=n>>4,n|=n>>8,n|=n>>16,n+1>>>0)}rent(n){if(!n||n<=0)return j.ZERO_BUFFER;const e=j._nextPow2(n),s=this.map.get(e);return s&&s.length?s.pop():new ArrayBuffer(e)}release(n){if(!n||!n.byteLength)return;const e=j._nextPow2(n.byteLength);let s=this.map.get(e);s||(s=[],this.map.set(e,s)),s.push(n)}}j.ZERO_BUFFER=new ArrayBuffer(0);const ln=new TextEncoder,un=new TextDecoder,z={keys:[],index:new Map},pe=2e3;function de(){z.keys=[],z.index=new Map}let V=!1;function ge(r,n={}){const e=[],s=[],i=[],u=new Map,l=!!n.useSharedKeyTable;let c,p;l?(c=z.keys,p=z.index):(c=[],p=new Map);let m=0,g=0;const y=x=>{if(Array.isArray(x)){const S=Number(x[0]),_=Number(x[1]);s.push(Number.isFinite(S)?S:0,Number.isFinite(_)?_:0)}else if(x&&(typeof x.x=="number"||typeof x.y=="number")){const S=Number(x.x),_=Number(x.y);s.push(Number.isFinite(S)?S:0,Number.isFinite(_)?_:0)}else s.push(0,0)};for(const x of r){const S=x.id==null?"":String(x.id),_=x.geometry||{},F=_.type||"Unknown",w={id:S,type:F,coordsOffset:m,coordsLength:0};if(F==="Point"){const M=_.coordinates||[];y(M),w.coordsLength=2}else if(F==="LineString"||F==="MultiPoint"){const M=_.coordinates||[];for(const A of M)y(A);w.coordsLength=(M.length||0)*2}else if(F==="Polygon"){const M=_.coordinates||[];w.ringLengths=[];for(const A of M){w.ringLengths.push(A.length||0);for(const k of A)y(k)}w.coordsLength=w.ringLengths.reduce((A,k)=>A+k,0)*2}else if(F==="MultiPolygon"){const M=_.coordinates||[];w.polygonRingCounts=[],w.ringLengths=[];for(const A of M){w.polygonRingCounts.push(A.length||0);for(const k of A){w.ringLengths.push(k.length||0);for(const B of k)y(B)}}w.coordsLength=w.ringLengths.reduce((A,k)=>A+k,0)*2}else w.coordsLength=0;const L=x.properties||{},T=[];for(const M of Object.keys(L)){let A=p.get(M);A===void 0&&(A=c.length,c.push(M),p.set(M,A),l&&c.length>pe&&(de(),c=z.keys,p=z.index));const k=L[M];let B;if(k===null||typeof k=="string"||typeof k=="number"||typeof k=="boolean"){const R=typeof k+"|"+String(k);if(B=u.get(R),!B){const t=JSON.stringify(k);B=ln.encode(t),u.set(R,B)}}else{const R=JSON.stringify(k);B=ln.encode(R)}i.push(B),T.push([A,g,B.length]),g+=B.length}w.props=T,m+=w.coordsLength,e.push(w)}let o;if(n.propsBuffer)n.propsBuffer instanceof Uint8Array?o=n.propsBuffer.subarray(0,g):o=new Uint8Array(n.propsBuffer,0,g),o.byteLength<g&&(o=new Uint8Array(g));else if(n.pool&&g>0){const x=n.pool.rent(g);o=new Uint8Array(x,0,g)}else o=new Uint8Array(g);let f=0;for(const x of i)o.set(x,f),f+=x.length;const d=s.length;let v;if(n.coordsBuffer)n.coordsBuffer instanceof ArrayBuffer?v=new Float32Array(n.coordsBuffer,0,d):n.coordsBuffer instanceof Float32Array?v=n.coordsBuffer.subarray(0,d):v=new Float32Array(d),v.length<d&&(v=new Float32Array(d));else if(n.pool&&d>0){const x=n.pool.rent(d*4);v=new Float32Array(x,0,d)}else v=new Float32Array(d);return v.length>0&&v.set(s),{meta:e,keys:c,propsBuffer:o,coordsArray:v}}function hn(r,n,e,s){const i=e instanceof Float32Array?e:new Float32Array(e),u=n instanceof Uint8Array?n:n?new Uint8Array(n):new Uint8Array(0),l=[];for(let c=0;c<(r.length||0);c++){const p=r[c]||{},m=p.id,g={};if(Array.isArray(p.props)&&p.props.length&&s&&s.length)for(const x of p.props){const[S,_,F]=x;try{const w=u.subarray(_,_+F);g[s[S]]=JSON.parse(un.decode(w))}catch{}}const y=p.type||"Unknown";let o=p.coordsOffset||0;const f=o+(p.coordsLength||0);let d=null;if(y==="Point"){const x=i[o],S=i[o+1],_=Number.isFinite(x)?Math.max(-180,Math.min(180,x)):0,F=Number.isFinite(S)?Math.max(-90,Math.min(90,S)):0;if((!Number.isFinite(x)||!Number.isFinite(S))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value",{index:c,id:m,rawX:x,rawY:S})}catch{}}d={type:"Point",coordinates:[_,F]}}else if(y==="LineString"||y==="MultiPoint"){const x=[];for(;o<f;o+=2){const S=i[o],_=i[o+1],F=Number.isFinite(S)?Math.max(-180,Math.min(180,S)):0,w=Number.isFinite(_)?Math.max(-90,Math.min(90,_)):0;if((!Number.isFinite(S)||!Number.isFinite(_))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value",{index:c,id:m,rawX:S,rawY:_})}catch{}}x.push([F,w])}d={type:y,coordinates:x}}else if(y==="Polygon"){const x=[],S=p.ringLengths||[];for(const _ of S){const F=[];for(let w=0;w<_;w++){const L=i[o],T=i[o+1],M=Number.isFinite(L)?Math.max(-180,Math.min(180,L)):0,A=Number.isFinite(T)?Math.max(-90,Math.min(90,T)):0;if((!Number.isFinite(L)||!Number.isFinite(T))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value",{index:c,id:m,rawX:L,rawY:T})}catch{}}F.push([M,A]),o+=2}x.push(F)}d={type:"Polygon",coordinates:x}}else if(y==="MultiPolygon"){const x=[],S=p.polygonRingCounts||[],_=p.ringLengths||[];let F=0;for(const w of S){const L=[];for(let T=0;T<w;T++){const M=_[F++]||0,A=[];for(let k=0;k<M;k++){const B=i[o],R=i[o+1],t=Number.isFinite(B)?Math.max(-180,Math.min(180,B)):0,a=Number.isFinite(R)?Math.max(-90,Math.min(90,R)):0;if((!Number.isFinite(B)||!Number.isFinite(R))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value",{index:c,id:m,rawX:B,rawY:R})}catch{}}A.push([t,a]),o+=2}L.push(A)}x.push(L)}d={type:"MultiPolygon",coordinates:x}}else if(o<f){const x=i[o],S=i[o+1],_=Number.isFinite(x)?Math.max(-180,Math.min(180,x)):0,F=Number.isFinite(S)?Math.max(-90,Math.min(90,S)):0;if((!Number.isFinite(x)||!Number.isFinite(S))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value",{index:c,id:m,rawX:x,rawY:S})}catch{}}d={type:"Point",coordinates:[_,F]}}d==null&&(d={type:"Point",coordinates:[0,0]});const v=g&&typeof g=="object"?g:{};l.push({type:"Feature",id:m,geometry:d,properties:v})}return l}const ye=new ArrayBuffer(4),kn=new DataView(ye);function me(){return 2166136261}function G(r,n){return r^=n>>>0,r=Math.imul(r,16777619)>>>0,r}function O(r,n){const e=Number(n)||0;return kn.setFloat32(0,e,!0),r=G(r,kn.getUint32(0,!0)),r}function xe(r,n){if(!n)return r;for(let e=0;e<n.length;e++){const s=n.charCodeAt(e);r=G(r,s&65535)}return r}function Q(r){if(!r)return 0;let n=me();n=xe(n,r.type||"");const e=r.type;if(e==="Point"){const s=r.coordinates||[];return n=O(n,s[0]),n=O(n,s[1]),n}if(e==="LineString"||e==="MultiPoint"){const s=r.coordinates||[];for(const i of s)n=O(n,i&&i[0]),n=O(n,i&&i[1]);return n}if(e==="Polygon"){const s=r.coordinates||[];n=G(n,s.length);for(const i of s){n=G(n,i.length||0);for(const u of i)n=O(n,u&&u[0]),n=O(n,u&&u[1])}return n}if(e==="MultiPolygon"){const s=r.coordinates||[];n=G(n,s.length);for(const i of s){n=G(n,i.length||0);for(const u of i){n=G(n,u.length||0);for(const l of u)n=O(n,l&&l[0]),n=O(n,l&&l[1])}}return n}try{const s=r.coordinates||[];for(const i of s)Array.isArray(i)?(n=O(n,i[0]),n=O(n,i[1])):n=O(n,i)}catch{}return n}class Tn{constructor(n){return this.map=n.map,this.source=n.source instanceof maplibregl.VectorTileSource?n.source:this.map.getSource(n.source),this.sourceLayer=n.sourceLayer,this.fid=n.fid||"id",this.tiles=this.source.tiles.map(e=>e.split("{z}")[0]),this.tileSize=this.source.tileSize||512,this.tolerance=n.tolerance||1e-5,this.cacheSize=n.cacheSize||1e4,this.units=n.units||"meters",this.seed=!1,this.minion=new ce,this._abPool=new j,this._lastGeomHashes=new Map,this.minion.onmessage=e=>{const s=e&&e.data;if(s)if(s.type==="geojson_bin"&&s.coords)try{const i=s.coords instanceof Uint8Array?s.coords.buffer:s.coords,u=s.propsBuf!==void 0?s.propsBuf:null,l=hn(s.meta||[],u,i,s.keys||[]);this.gjsource.setData({type:"FeatureCollection",features:l});try{for(const c of l)if(c&&c.id!=null)try{this._lastGeomHashes.set(String(c.id),Q(c.geometry))}catch{this._lastGeomHashes.set(String(c.id),0)}}catch{}try{u&&this._abPool.release(u instanceof ArrayBuffer?u:u.buffer)}catch{}try{i&&this._abPool.release(i instanceof ArrayBuffer?i:i.buffer)}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch(i){console.warn("Failed to decode binary worker response",i)}else if(s.type==="geojson_diff")try{const i=s&&s.diff?s.diff:{};if(this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(i);try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process geojson diff from worker",i)}else if(s.type==="geojson_diff_bin")try{const i=s.removeList||[],u=!!s.removeAll;let l=[];if(s.add&&s.add.coords)try{const o=s.add.propsBuf!==void 0?s.add.propsBuf:null,f=s.add.coords;l=hn(s.add.meta||[],o,f,s.add.keys||[]);try{o&&this._abPool.release(o instanceof ArrayBuffer?o:o.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode add-list from worker",o);try{this.minion.postMessage({type:"request_full"})}catch{}return}let c=[];if(s.update&&s.update.coords)try{const o=s.update.propsBuf!==void 0?s.update.propsBuf:null,f=s.update.coords;c=hn(s.update.meta||[],o,f,s.update.keys||[]);try{o&&this._abPool.release(o instanceof ArrayBuffer?o:o.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode update-list from worker",o);try{this.minion.postMessage({type:"request_full"})}catch{}return}let p=[];if(s.updateDiffs&&Array.isArray(s.updateDiffs))p=s.updateDiffs;else if(s.updateDiffsMeta&&Array.isArray(s.updateDiffsMeta))try{const o=s.updateKeys||[],f=s.updatePropsBuf!==void 0?s.updatePropsBuf:null,d=f?f instanceof Uint8Array?f:new Uint8Array(f):new Uint8Array(0),v=un;for(const x of s.updateDiffsMeta){const S={id:x.id};if(x.removeAllProperties&&(S.removeAllProperties=!0),Array.isArray(x.removeProperties)&&x.removeProperties.length&&(S.removeProperties=x.removeProperties.map(_=>o[_])),Array.isArray(x.addOrUpdate)&&x.addOrUpdate.length){const _=[];for(const F of x.addOrUpdate){const[w,L,T]=F,M=o[w];try{const A=d.subarray(L,L+T),k=JSON.parse(v.decode(A));_.push({key:M,value:k})}catch{}}_.length&&(S.addOrUpdateProperties=_)}p.push(S)}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(o){console.warn("Failed to decode compacted update diffs",o)}const m=new Map((c||[]).map(o=>[String(o.id),o])),g=p.map(o=>{const f={id:o.id},d=m.get(String(o.id));return d&&d.geometry&&(f.newGeometry=d.geometry),o.removeAllProperties&&(f.removeAllProperties=!0),o.removeProperties&&(f.removeProperties=o.removeProperties),o.addOrUpdateProperties&&(f.addOrUpdateProperties=o.addOrUpdateProperties),f}).filter(o=>o!=null),y={};if(u?y.removeAll=!0:i.length&&(y.remove=i),l.length&&(y.add=l),g.length&&(y.update=g),this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(y);try{if(l&&l.length){for(const o of l)if(o&&o.id!=null)try{this._lastGeomHashes.set(String(o.id),Q(o.geometry))}catch{this._lastGeomHashes.set(String(o.id),0)}}if(c&&c.length){for(const o of c)if(o&&o.id!=null)try{this._lastGeomHashes.set(String(o.id),Q(o.geometry))}catch{this._lastGeomHashes.set(String(o.id),0)}}if(i&&i.length)for(const o of i)this._lastGeomHashes.delete(String(o))}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process binary geojson diff from worker",i)}else if(s.type==="geojson"&&s.payload)try{const i=s.payload instanceof Uint8Array?s.payload.buffer:s.payload,u=un.decode(i),l=JSON.parse(u);this.gjsource.setData(l)}catch(i){console.warn("Failed to decode worker response",i)}else try{this.gjsource.setData(s)}catch(i){console.warn("Failed to set worker data",i)}},this.map.addSource(this.source.id+"-proper",{type:"geojson",maxzoom:this.source.maxzoom,promoteId:this.fid,data:{}}),this.gjsource=this.map.getSource(this.source.id+"-proper"),maplibregl.addProtocol("proper",this._protocol),this.map.setTransformRequest((e,s)=>this.tiles.some(u=>e.startsWith(u))&&s==="Tile"?{url:"proper://"+e}:{url:e}),this._pendingPost=null,this._postTimer=null,this._postDelay=n.postDelay||100,this.map.on("sourcedata",e=>{if(e.sourceId===this.source.id&&e.isSourceLoaded){const s=this.map.querySourceFeatures(this.source.id,{sourceLayer:this.sourceLayer}),i=e.tile.tileID.canonical.z,u=this.tolerance*Math.pow(10,-.301*i+5.19),l={features:s.map(c=>({id:c.id,geometry:c.geometry,properties:c.properties})),tolerance:u,unit:this.units};this._pendingPost=l,this._postTimer==null&&(this._postTimer=setTimeout(()=>{try{if(this._pendingPost){const c=this._pendingPost.features||[],p=new Map;for(const g of c){const y=String(g.id==null?"":g.id);let o=0;try{o=Q(g.geometry)}catch{o=0}p.set(y,o)}let m=!0;if(this._lastGeomHashes&&this._lastGeomHashes.size===c.length){for(const[g,y]of p.entries())if(this._lastGeomHashes.get(g)!==y){m=!1;break}}else m=!1;if(m){this._lastGeomHashes=p;return}try{const{meta:g,keys:y,propsBuffer:o,coordsArray:f}=ge(this._pendingPost.features||[],{pool:this._abPool,useSharedKeyTable:!0}),d=Object.fromEntries(p);this.minion.postMessage({type:"features_bin",meta:g,keys:y,propsBuf:o.buffer,tolerance:this._pendingPost.tolerance,coords:f.buffer,cacheSize:this.cacheSize,promoteId:this.fid,hashes:d},[o.buffer,f.buffer]),this._lastGeomHashes=p}catch{try{const y=Object.assign({},this._pendingPost,{promoteId:this.fid}),o=JSON.stringify(y),f=ln.encode(o);this.minion.postMessage({type:"features",payload:f.buffer},[f.buffer])}catch{const o=Object.assign({},this._pendingPost,{promoteId:this.fid});this.minion.postMessage(o)}}}}finally{this._pendingPost=null,this._postTimer=null}},this._postDelay))}}),this.map.refreshTiles(this.source.id),this.gjsource}_protocol=async n=>{const s=n.url.replace("proper://",""),i=n.url.split(/\/|\./i);if(i===null||i.length<4)return console.warn(`Malformed URL: ${n.url}`),{data:null};const u=await fetch(s);let l;if(u.status===200){const c=i.length,[p,m,g]=i.slice(c-4,c-1).map(d=>d*1),y=await u.arrayBuffer(),o=new te(new Bn(y)),f={layers:Object.entries(o.layers).reduce((d,[v,x])=>({...d,[v]:{...x,feature:S=>{const _=x.feature(S),w=_.loadGeometry().flat(1/0).some(L=>L.x>=x.extent-1||L.y>=x.extent-1||L.x<=1||L.y<=1);return _.properties.clipped=w,_}}}),{})};l=Mn(f).buffer}else l=Mn({}).buffer;return{data:l}}}return maplibregl.VectorTileSource.prototype.ProperLabels=function(r){const n=Object.assign({},r,{map:this._map,source:this});return this._proper||(this._proper=new Tn(n)),this._proper},Tn}));
