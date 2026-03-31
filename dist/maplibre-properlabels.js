(function(z,R){typeof exports=="object"&&typeof module<"u"?module.exports=R():typeof define=="function"&&define.amd?define(R):(z=typeof globalThis<"u"?globalThis:z||self,z.ProperLabels=R())})(this,(function(){"use strict";const R=23283064365386963e-26,_n=12,an=typeof TextDecoder>"u"?null:new TextDecoder("utf-8"),X=0,K=1,j=2,$=5;class An{constructor(n=new Uint8Array(16)){this.buf=ArrayBuffer.isView(n)?n:new Uint8Array(n),this.dataView=new DataView(this.buf.buffer),this.pos=0,this.type=0,this.length=this.buf.length}readFields(n,e,s=this.length){for(;this.pos<s;){const i=this.readVarint(),l=i>>3,u=this.pos;this.type=i&7,n(l,e,this),this.pos===u&&this.skip(i)}return e}readMessage(n,e){return this.readFields(n,e,this.readVarint()+this.pos)}readFixed32(){const n=this.dataView.getUint32(this.pos,!0);return this.pos+=4,n}readSFixed32(){const n=this.dataView.getInt32(this.pos,!0);return this.pos+=4,n}readFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getUint32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readSFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getInt32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readFloat(){const n=this.dataView.getFloat32(this.pos,!0);return this.pos+=4,n}readDouble(){const n=this.dataView.getFloat64(this.pos,!0);return this.pos+=8,n}readVarint(n){const e=this.buf;let s,i;return i=e[this.pos++],s=i&127,i<128||(i=e[this.pos++],s|=(i&127)<<7,i<128)||(i=e[this.pos++],s|=(i&127)<<14,i<128)||(i=e[this.pos++],s|=(i&127)<<21,i<128)?s:(i=e[this.pos],s|=(i&15)<<28,Ln(s,n,this))}readVarint64(){return this.readVarint(!0)}readSVarint(){const n=this.readVarint();return n%2===1?(n+1)/-2:n/2}readBoolean(){return!!this.readVarint()}readString(){const n=this.readVarint()+this.pos,e=this.pos;return this.pos=n,n-e>=_n&&an?an.decode(this.buf.subarray(e,n)):qn(this.buf,e,n)}readBytes(){const n=this.readVarint()+this.pos,e=this.buf.subarray(this.pos,n);return this.pos=n,e}readPackedVarint(n=[],e){const s=this.readPackedEnd();for(;this.pos<s;)n.push(this.readVarint(e));return n}readPackedSVarint(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSVarint());return n}readPackedBoolean(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readBoolean());return n}readPackedFloat(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFloat());return n}readPackedDouble(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readDouble());return n}readPackedFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed32());return n}readPackedSFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed32());return n}readPackedFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed64());return n}readPackedSFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed64());return n}readPackedEnd(){return this.type===j?this.readVarint()+this.pos:this.pos+1}skip(n){const e=n&7;if(e===X)for(;this.buf[this.pos++]>127;);else if(e===j)this.pos=this.readVarint()+this.pos;else if(e===$)this.pos+=4;else if(e===K)this.pos+=8;else throw new Error(`Unimplemented type: ${e}`)}writeTag(n,e){this.writeVarint(n<<3|e)}realloc(n){let e=this.length||16;for(;e<this.pos+n;)e*=2;if(e!==this.length){const s=new Uint8Array(e);s.set(this.buf),this.buf=s,this.dataView=new DataView(s.buffer),this.length=e}}finish(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)}writeFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeSFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*R),!0),this.pos+=8}writeSFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*R),!0),this.pos+=8}writeVarint(n){if(n=+n||0,n>268435455||n<0){Tn(n,this);return}this.realloc(4),this.buf[this.pos++]=n&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=n>>>7&127)))}writeSVarint(n){this.writeVarint(n<0?-n*2-1:n*2)}writeBoolean(n){this.writeVarint(+n)}writeString(n){n=String(n),this.realloc(n.length*4),this.pos++;const e=this.pos;this.pos=jn(this.buf,n,this.pos);const s=this.pos-e;s>=128&&un(e,s,this),this.pos=e-1,this.writeVarint(s),this.pos+=s}writeFloat(n){this.realloc(4),this.dataView.setFloat32(this.pos,n,!0),this.pos+=4}writeDouble(n){this.realloc(8),this.dataView.setFloat64(this.pos,n,!0),this.pos+=8}writeBytes(n){const e=n.length;this.writeVarint(e),this.realloc(e);for(let s=0;s<e;s++)this.buf[this.pos++]=n[s]}writeRawMessage(n,e){this.pos++;const s=this.pos;n(e,this);const i=this.pos-s;i>=128&&un(s,i,this),this.pos=s-1,this.writeVarint(i),this.pos+=i}writeMessage(n,e,s){this.writeTag(n,j),this.writeRawMessage(e,s)}writePackedVarint(n,e){e.length&&this.writeMessage(n,On,e)}writePackedSVarint(n,e){e.length&&this.writeMessage(n,Bn,e)}writePackedBoolean(n,e){e.length&&this.writeMessage(n,Rn,e)}writePackedFloat(n,e){e.length&&this.writeMessage(n,Cn,e)}writePackedDouble(n,e){e.length&&this.writeMessage(n,Vn,e)}writePackedFixed32(n,e){e.length&&this.writeMessage(n,In,e)}writePackedSFixed32(n,e){e.length&&this.writeMessage(n,Dn,e)}writePackedFixed64(n,e){e.length&&this.writeMessage(n,Gn,e)}writePackedSFixed64(n,e){e.length&&this.writeMessage(n,Un,e)}writeBytesField(n,e){this.writeTag(n,j),this.writeBytes(e)}writeFixed32Field(n,e){this.writeTag(n,$),this.writeFixed32(e)}writeSFixed32Field(n,e){this.writeTag(n,$),this.writeSFixed32(e)}writeFixed64Field(n,e){this.writeTag(n,K),this.writeFixed64(e)}writeSFixed64Field(n,e){this.writeTag(n,K),this.writeSFixed64(e)}writeVarintField(n,e){this.writeTag(n,X),this.writeVarint(e)}writeSVarintField(n,e){this.writeTag(n,X),this.writeSVarint(e)}writeStringField(n,e){this.writeTag(n,j),this.writeString(e)}writeFloatField(n,e){this.writeTag(n,$),this.writeFloat(e)}writeDoubleField(n,e){this.writeTag(n,K),this.writeDouble(e)}writeBooleanField(n,e){this.writeVarintField(n,+e)}}function Ln(r,n,e){const s=e.buf;let i,l;if(l=s[e.pos++],i=(l&112)>>4,l<128||(l=s[e.pos++],i|=(l&127)<<3,l<128)||(l=s[e.pos++],i|=(l&127)<<10,l<128)||(l=s[e.pos++],i|=(l&127)<<17,l<128)||(l=s[e.pos++],i|=(l&127)<<24,l<128)||(l=s[e.pos++],i|=(l&1)<<31,l<128))return I(r,i,n);throw new Error("Expected varint not more than 10 bytes")}function I(r,n,e){return e?n*4294967296+(r>>>0):(n>>>0)*4294967296+(r>>>0)}function Tn(r,n){let e,s;if(r>=0?(e=r%4294967296|0,s=r/4294967296|0):(e=~(-r%4294967296),s=~(-r/4294967296),e^4294967295?e=e+1|0:(e=0,s=s+1|0)),r>=18446744073709552e3||r<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");n.realloc(10),kn(e,s,n),Nn(s,n)}function kn(r,n,e){e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos]=r&127}function Nn(r,n){const e=(r&7)<<4;n.buf[n.pos++]|=e|((r>>>=3)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127)))))}function un(r,n,e){const s=n<=16383?1:n<=2097151?2:n<=268435455?3:Math.floor(Math.log(n)/(Math.LN2*7));e.realloc(s);for(let i=e.pos-1;i>=r;i--)e.buf[i+s]=e.buf[i]}function On(r,n){for(let e=0;e<r.length;e++)n.writeVarint(r[e])}function Bn(r,n){for(let e=0;e<r.length;e++)n.writeSVarint(r[e])}function Cn(r,n){for(let e=0;e<r.length;e++)n.writeFloat(r[e])}function Vn(r,n){for(let e=0;e<r.length;e++)n.writeDouble(r[e])}function Rn(r,n){for(let e=0;e<r.length;e++)n.writeBoolean(r[e])}function In(r,n){for(let e=0;e<r.length;e++)n.writeFixed32(r[e])}function Dn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed32(r[e])}function Gn(r,n){for(let e=0;e<r.length;e++)n.writeFixed64(r[e])}function Un(r,n){for(let e=0;e<r.length;e++)n.writeSFixed64(r[e])}function qn(r,n,e){let s="",i=n;for(;i<e;){const l=r[i];let u=null,d=l>239?4:l>223?3:l>191?2:1;if(i+d>e)break;let c,g,y;d===1?l<128&&(u=l):d===2?(c=r[i+1],(c&192)===128&&(u=(l&31)<<6|c&63,u<=127&&(u=null))):d===3?(c=r[i+1],g=r[i+2],(c&192)===128&&(g&192)===128&&(u=(l&15)<<12|(c&63)<<6|g&63,(u<=2047||u>=55296&&u<=57343)&&(u=null))):d===4&&(c=r[i+1],g=r[i+2],y=r[i+3],(c&192)===128&&(g&192)===128&&(y&192)===128&&(u=(l&15)<<18|(c&63)<<12|(g&63)<<6|y&63,(u<=65535||u>=1114112)&&(u=null))),u===null?(u=65533,d=1):u>65535&&(u-=65536,s+=String.fromCharCode(u>>>10&1023|55296),u=56320|u&1023),s+=String.fromCharCode(u),i+=d}return s}function jn(r,n,e){for(let s=0,i,l;s<n.length;s++){if(i=n.charCodeAt(s),i>55295&&i<57344)if(l)if(i<56320){r[e++]=239,r[e++]=191,r[e++]=189,l=i;continue}else i=l-55296<<10|i-56320|65536,l=null;else{i>56319||s+1===n.length?(r[e++]=239,r[e++]=191,r[e++]=189):l=i;continue}else l&&(r[e++]=239,r[e++]=191,r[e++]=189,l=null);i<128?r[e++]=i:(i<2048?r[e++]=i>>6|192:(i<65536?r[e++]=i>>12|224:(r[e++]=i>>18|240,r[e++]=i>>12&63|128),r[e++]=i>>6&63|128),r[e++]=i&63|128)}return e}function C(r,n){this.x=r,this.y=n}C.prototype={clone(){return new C(this.x,this.y)},add(r){return this.clone()._add(r)},sub(r){return this.clone()._sub(r)},multByPoint(r){return this.clone()._multByPoint(r)},divByPoint(r){return this.clone()._divByPoint(r)},mult(r){return this.clone()._mult(r)},div(r){return this.clone()._div(r)},rotate(r){return this.clone()._rotate(r)},rotateAround(r,n){return this.clone()._rotateAround(r,n)},matMult(r){return this.clone()._matMult(r)},unit(){return this.clone()._unit()},perp(){return this.clone()._perp()},round(){return this.clone()._round()},mag(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals(r){return this.x===r.x&&this.y===r.y},dist(r){return Math.sqrt(this.distSqr(r))},distSqr(r){const n=r.x-this.x,e=r.y-this.y;return n*n+e*e},angle(){return Math.atan2(this.y,this.x)},angleTo(r){return Math.atan2(this.y-r.y,this.x-r.x)},angleWith(r){return this.angleWithSep(r.x,r.y)},angleWithSep(r,n){return Math.atan2(this.x*n-this.y*r,this.x*r+this.y*n)},_matMult(r){const n=r[0]*this.x+r[1]*this.y,e=r[2]*this.x+r[3]*this.y;return this.x=n,this.y=e,this},_add(r){return this.x+=r.x,this.y+=r.y,this},_sub(r){return this.x-=r.x,this.y-=r.y,this},_mult(r){return this.x*=r,this.y*=r,this},_div(r){return this.x/=r,this.y/=r,this},_multByPoint(r){return this.x*=r.x,this.y*=r.y,this},_divByPoint(r){return this.x/=r.x,this.y/=r.y,this},_unit(){return this._div(this.mag()),this},_perp(){const r=this.y;return this.y=this.x,this.x=-r,this},_rotate(r){const n=Math.cos(r),e=Math.sin(r),s=n*this.x-e*this.y,i=e*this.x+n*this.y;return this.x=s,this.y=i,this},_rotateAround(r,n){const e=Math.cos(r),s=Math.sin(r),i=n.x+e*(this.x-n.x)-s*(this.y-n.y),l=n.y+s*(this.x-n.x)+e*(this.y-n.y);return this.x=i,this.y=l,this},_round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},constructor:C},C.convert=function(r){if(r instanceof C)return r;if(Array.isArray(r))return new C(+r[0],+r[1]);if(r.x!==void 0&&r.y!==void 0)return new C(+r.x,+r.y);throw new Error("Expected [x, y] or {x, y} point format")};class ln{constructor(n,e,s,i,l){this.properties={},this.extent=s,this.type=0,this.id=void 0,this._pbf=n,this._geometry=-1,this._keys=i,this._values=l,n.readFields(Hn,this,e)}loadGeometry(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos,s=[];let i,l=1,u=0,d=0,c=0;for(;n.pos<e;){if(u<=0){const g=n.readVarint();l=g&7,u=g>>3}if(u--,l===1||l===2)d+=n.readSVarint(),c+=n.readSVarint(),l===1&&(i&&s.push(i),i=[]),i&&i.push(new C(d,c));else if(l===7)i&&i.push(i[0].clone());else throw new Error(`unknown command ${l}`)}return i&&s.push(i),s}bbox(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos;let s=1,i=0,l=0,u=0,d=1/0,c=-1/0,g=1/0,y=-1/0;for(;n.pos<e;){if(i<=0){const x=n.readVarint();s=x&7,i=x>>3}if(i--,s===1||s===2)l+=n.readSVarint(),u+=n.readSVarint(),l<d&&(d=l),l>c&&(c=l),u<g&&(g=u),u>y&&(y=u);else if(s!==7)throw new Error(`unknown command ${s}`)}return[d,g,c,y]}toGeoJSON(n,e,s){const i=this.extent*Math.pow(2,s),l=this.extent*n,u=this.extent*e,d=this.loadGeometry();function c(a){return[(a.x+l)*360/i-180,360/Math.PI*Math.atan(Math.exp((1-(a.y+u)*2/i)*Math.PI))-90]}function g(a){return a.map(c)}let y;if(this.type===1){const a=[];for(const p of d)a.push(p[0]);const f=g(a);y=a.length===1?{type:"Point",coordinates:f[0]}:{type:"MultiPoint",coordinates:f}}else if(this.type===2){const a=d.map(g);y=a.length===1?{type:"LineString",coordinates:a[0]}:{type:"MultiLineString",coordinates:a}}else if(this.type===3){const a=Kn(d),f=[];for(const p of a)f.push(p.map(g));y=f.length===1?{type:"Polygon",coordinates:f[0]}:{type:"MultiPolygon",coordinates:f}}else throw new Error("unknown feature type");const x={type:"Feature",geometry:y,properties:this.properties};return this.id!=null&&(x.id=this.id),x}}ln.types=["Unknown","Point","LineString","Polygon"];function Hn(r,n,e){r===1?n.id=e.readVarint():r===2?zn(e,n):r===3?n.type=e.readVarint():r===4&&(n._geometry=e.pos)}function zn(r,n){const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=n._keys[r.readVarint()],i=n._values[r.readVarint()];n.properties[s]=i}}function Kn(r){const n=r.length;if(n<=1)return[r];const e=[];let s,i;for(let l=0;l<n;l++){const u=$n(r[l]);u!==0&&(i===void 0&&(i=u<0),i===u<0?(s&&e.push(s),s=[r[l]]):s&&s.push(r[l]))}return s&&e.push(s),e}function $n(r){let n=0;for(let e=0,s=r.length,i=s-1,l,u;e<s;i=e++)l=r[e],u=r[i],n+=(u.x-l.x)*(l.y+u.y);return n}class Wn{constructor(n,e){this.version=1,this.name="",this.extent=4096,this.length=0,this._pbf=n,this._keys=[],this._values=[],this._features=[],n.readFields(Jn,this,e),this.length=this._features.length}feature(n){if(n<0||n>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[n];const e=this._pbf.readVarint()+this._pbf.pos;return new ln(this._pbf,e,this.extent,this._keys,this._values)}}function Jn(r,n,e){r===15?n.version=e.readVarint():r===1?n.name=e.readString():r===5?n.extent=e.readVarint():r===2?n._features.push(e.pos):r===3?n._keys.push(e.readString()):r===4&&n._values.push(Xn(e))}function Xn(r){let n=null;const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=r.readVarint()>>3;n=s===1?r.readString():s===2?r.readFloat():s===3?r.readDouble():s===4?r.readVarint64():s===5?r.readVarint():s===6?r.readSVarint():s===7?r.readBoolean():null}if(n==null)throw new Error("unknown feature value");return n}class Yn{constructor(n,e){this.layers=n.readFields(Zn,{},e)}}function Zn(r,n,e){if(r===3){const s=new Wn(e,e.readVarint()+e.pos);s.length&&(n[s.name]=s)}}function Qn(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var D={exports:{}},W={};var hn;function ne(){return hn||(hn=1,W.read=function(r,n,e,s,i){var l,u,d=i*8-s-1,c=(1<<d)-1,g=c>>1,y=-7,x=e?i-1:0,a=e?-1:1,f=r[n+x];for(x+=a,l=f&(1<<-y)-1,f>>=-y,y+=d;y>0;l=l*256+r[n+x],x+=a,y-=8);for(u=l&(1<<-y)-1,l>>=-y,y+=s;y>0;u=u*256+r[n+x],x+=a,y-=8);if(l===0)l=1-g;else{if(l===c)return u?NaN:(f?-1:1)*(1/0);u=u+Math.pow(2,s),l=l-g}return(f?-1:1)*u*Math.pow(2,l-s)},W.write=function(r,n,e,s,i,l){var u,d,c,g=l*8-i-1,y=(1<<g)-1,x=y>>1,a=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,f=s?0:l-1,p=s?1:-1,P=n<0||n===0&&1/n<0?1:0;for(n=Math.abs(n),isNaN(n)||n===1/0?(d=isNaN(n)?1:0,u=y):(u=Math.floor(Math.log(n)/Math.LN2),n*(c=Math.pow(2,-u))<1&&(u--,c*=2),u+x>=1?n+=a/c:n+=a*Math.pow(2,1-x),n*c>=2&&(u++,c/=2),u+x>=y?(d=0,u=y):u+x>=1?(d=(n*c-1)*Math.pow(2,i),u=u+x):(d=n*Math.pow(2,x-1)*Math.pow(2,i),u=0));i>=8;r[e+f]=d&255,f+=p,d/=256,i-=8);for(u=u<<i|d,g+=i;g>0;r[e+f]=u&255,f+=p,u/=256,g-=8);r[e+f-p]|=P*128}),W}var Y,fn;function ee(){if(fn)return Y;fn=1,Y=n;var r=ne();function n(t){this.buf=ArrayBuffer.isView&&ArrayBuffer.isView(t)?t:new Uint8Array(t||0),this.pos=0,this.type=0,this.length=this.buf.length}n.Varint=0,n.Fixed64=1,n.Bytes=2,n.Fixed32=5;var e=65536*65536,s=1/e,i=12,l=typeof TextDecoder>"u"?null:new TextDecoder("utf-8");n.prototype={destroy:function(){this.buf=null},readFields:function(t,o,h){for(h=h||this.length;this.pos<h;){var v=this.readVarint(),b=v>>3,_=this.pos;this.type=v&7,t(b,o,this),this.pos===_&&this.skip(v)}return o},readMessage:function(t,o){return this.readFields(t,o,this.readVarint()+this.pos)},readFixed32:function(){var t=E(this.buf,this.pos);return this.pos+=4,t},readSFixed32:function(){var t=T(this.buf,this.pos);return this.pos+=4,t},readFixed64:function(){var t=E(this.buf,this.pos)+E(this.buf,this.pos+4)*e;return this.pos+=8,t},readSFixed64:function(){var t=E(this.buf,this.pos)+T(this.buf,this.pos+4)*e;return this.pos+=8,t},readFloat:function(){var t=r.read(this.buf,this.pos,!0,23,4);return this.pos+=4,t},readDouble:function(){var t=r.read(this.buf,this.pos,!0,52,8);return this.pos+=8,t},readVarint:function(t){var o=this.buf,h,v;return v=o[this.pos++],h=v&127,v<128||(v=o[this.pos++],h|=(v&127)<<7,v<128)||(v=o[this.pos++],h|=(v&127)<<14,v<128)||(v=o[this.pos++],h|=(v&127)<<21,v<128)?h:(v=o[this.pos],h|=(v&15)<<28,u(h,t,this))},readVarint64:function(){return this.readVarint(!0)},readSVarint:function(){var t=this.readVarint();return t%2===1?(t+1)/-2:t/2},readBoolean:function(){return!!this.readVarint()},readString:function(){var t=this.readVarint()+this.pos,o=this.pos;return this.pos=t,t-o>=i&&l?G(this.buf,o,t):O(this.buf,o,t)},readBytes:function(){var t=this.readVarint()+this.pos,o=this.buf.subarray(this.pos,t);return this.pos=t,o},readPackedVarint:function(t,o){if(this.type!==n.Bytes)return t.push(this.readVarint(o));var h=d(this);for(t=t||[];this.pos<h;)t.push(this.readVarint(o));return t},readPackedSVarint:function(t){if(this.type!==n.Bytes)return t.push(this.readSVarint());var o=d(this);for(t=t||[];this.pos<o;)t.push(this.readSVarint());return t},readPackedBoolean:function(t){if(this.type!==n.Bytes)return t.push(this.readBoolean());var o=d(this);for(t=t||[];this.pos<o;)t.push(this.readBoolean());return t},readPackedFloat:function(t){if(this.type!==n.Bytes)return t.push(this.readFloat());var o=d(this);for(t=t||[];this.pos<o;)t.push(this.readFloat());return t},readPackedDouble:function(t){if(this.type!==n.Bytes)return t.push(this.readDouble());var o=d(this);for(t=t||[];this.pos<o;)t.push(this.readDouble());return t},readPackedFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed32());var o=d(this);for(t=t||[];this.pos<o;)t.push(this.readFixed32());return t},readPackedSFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed32());var o=d(this);for(t=t||[];this.pos<o;)t.push(this.readSFixed32());return t},readPackedFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed64());var o=d(this);for(t=t||[];this.pos<o;)t.push(this.readFixed64());return t},readPackedSFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed64());var o=d(this);for(t=t||[];this.pos<o;)t.push(this.readSFixed64());return t},skip:function(t){var o=t&7;if(o===n.Varint)for(;this.buf[this.pos++]>127;);else if(o===n.Bytes)this.pos=this.readVarint()+this.pos;else if(o===n.Fixed32)this.pos+=4;else if(o===n.Fixed64)this.pos+=8;else throw new Error("Unimplemented type: "+o)},writeTag:function(t,o){this.writeVarint(t<<3|o)},realloc:function(t){for(var o=this.length||16;o<this.pos+t;)o*=2;if(o!==this.length){var h=new Uint8Array(o);h.set(this.buf),this.buf=h,this.length=o}},finish:function(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)},writeFixed32:function(t){this.realloc(4),L(this.buf,t,this.pos),this.pos+=4},writeSFixed32:function(t){this.realloc(4),L(this.buf,t,this.pos),this.pos+=4},writeFixed64:function(t){this.realloc(8),L(this.buf,t&-1,this.pos),L(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeSFixed64:function(t){this.realloc(8),L(this.buf,t&-1,this.pos),L(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeVarint:function(t){if(t=+t||0,t>268435455||t<0){g(t,this);return}this.realloc(4),this.buf[this.pos++]=t&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=t>>>7&127)))},writeSVarint:function(t){this.writeVarint(t<0?-t*2-1:t*2)},writeBoolean:function(t){this.writeVarint(!!t)},writeString:function(t){t=String(t),this.realloc(t.length*4),this.pos++;var o=this.pos;this.pos=U(this.buf,t,this.pos);var h=this.pos-o;h>=128&&a(o,h,this),this.pos=o-1,this.writeVarint(h),this.pos+=h},writeFloat:function(t){this.realloc(4),r.write(this.buf,t,this.pos,!0,23,4),this.pos+=4},writeDouble:function(t){this.realloc(8),r.write(this.buf,t,this.pos,!0,52,8),this.pos+=8},writeBytes:function(t){var o=t.length;this.writeVarint(o),this.realloc(o);for(var h=0;h<o;h++)this.buf[this.pos++]=t[h]},writeRawMessage:function(t,o){this.pos++;var h=this.pos;t(o,this);var v=this.pos-h;v>=128&&a(h,v,this),this.pos=h-1,this.writeVarint(v),this.pos+=v},writeMessage:function(t,o,h){this.writeTag(t,n.Bytes),this.writeRawMessage(o,h)},writePackedVarint:function(t,o){o.length&&this.writeMessage(t,f,o)},writePackedSVarint:function(t,o){o.length&&this.writeMessage(t,p,o)},writePackedBoolean:function(t,o){o.length&&this.writeMessage(t,S,o)},writePackedFloat:function(t,o){o.length&&this.writeMessage(t,P,o)},writePackedDouble:function(t,o){o.length&&this.writeMessage(t,m,o)},writePackedFixed32:function(t,o){o.length&&this.writeMessage(t,w,o)},writePackedSFixed32:function(t,o){o.length&&this.writeMessage(t,A,o)},writePackedFixed64:function(t,o){o.length&&this.writeMessage(t,M,o)},writePackedSFixed64:function(t,o){o.length&&this.writeMessage(t,F,o)},writeBytesField:function(t,o){this.writeTag(t,n.Bytes),this.writeBytes(o)},writeFixed32Field:function(t,o){this.writeTag(t,n.Fixed32),this.writeFixed32(o)},writeSFixed32Field:function(t,o){this.writeTag(t,n.Fixed32),this.writeSFixed32(o)},writeFixed64Field:function(t,o){this.writeTag(t,n.Fixed64),this.writeFixed64(o)},writeSFixed64Field:function(t,o){this.writeTag(t,n.Fixed64),this.writeSFixed64(o)},writeVarintField:function(t,o){this.writeTag(t,n.Varint),this.writeVarint(o)},writeSVarintField:function(t,o){this.writeTag(t,n.Varint),this.writeSVarint(o)},writeStringField:function(t,o){this.writeTag(t,n.Bytes),this.writeString(o)},writeFloatField:function(t,o){this.writeTag(t,n.Fixed32),this.writeFloat(o)},writeDoubleField:function(t,o){this.writeTag(t,n.Fixed64),this.writeDouble(o)},writeBooleanField:function(t,o){this.writeVarintField(t,!!o)}};function u(t,o,h){var v=h.buf,b,_;if(_=v[h.pos++],b=(_&112)>>4,_<128||(_=v[h.pos++],b|=(_&127)<<3,_<128)||(_=v[h.pos++],b|=(_&127)<<10,_<128)||(_=v[h.pos++],b|=(_&127)<<17,_<128)||(_=v[h.pos++],b|=(_&127)<<24,_<128)||(_=v[h.pos++],b|=(_&1)<<31,_<128))return c(t,b,o);throw new Error("Expected varint not more than 10 bytes")}function d(t){return t.type===n.Bytes?t.readVarint()+t.pos:t.pos+1}function c(t,o,h){return h?o*4294967296+(t>>>0):(o>>>0)*4294967296+(t>>>0)}function g(t,o){var h,v;if(t>=0?(h=t%4294967296|0,v=t/4294967296|0):(h=~(-t%4294967296),v=~(-t/4294967296),h^4294967295?h=h+1|0:(h=0,v=v+1|0)),t>=18446744073709552e3||t<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");o.realloc(10),y(h,v,o),x(v,o)}function y(t,o,h){h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos]=t&127}function x(t,o){var h=(t&7)<<4;o.buf[o.pos++]|=h|((t>>>=3)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127)))))}function a(t,o,h){var v=o<=16383?1:o<=2097151?2:o<=268435455?3:Math.floor(Math.log(o)/(Math.LN2*7));h.realloc(v);for(var b=h.pos-1;b>=t;b--)h.buf[b+v]=h.buf[b]}function f(t,o){for(var h=0;h<t.length;h++)o.writeVarint(t[h])}function p(t,o){for(var h=0;h<t.length;h++)o.writeSVarint(t[h])}function P(t,o){for(var h=0;h<t.length;h++)o.writeFloat(t[h])}function m(t,o){for(var h=0;h<t.length;h++)o.writeDouble(t[h])}function S(t,o){for(var h=0;h<t.length;h++)o.writeBoolean(t[h])}function w(t,o){for(var h=0;h<t.length;h++)o.writeFixed32(t[h])}function A(t,o){for(var h=0;h<t.length;h++)o.writeSFixed32(t[h])}function M(t,o){for(var h=0;h<t.length;h++)o.writeFixed64(t[h])}function F(t,o){for(var h=0;h<t.length;h++)o.writeSFixed64(t[h])}function E(t,o){return(t[o]|t[o+1]<<8|t[o+2]<<16)+t[o+3]*16777216}function L(t,o,h){t[h]=o,t[h+1]=o>>>8,t[h+2]=o>>>16,t[h+3]=o>>>24}function T(t,o){return(t[o]|t[o+1]<<8|t[o+2]<<16)+(t[o+3]<<24)}function O(t,o,h){for(var v="",b=o;b<h;){var _=t[b],k=null,V=_>239?4:_>223?3:_>191?2:1;if(b+V>h)break;var B,q,on;V===1?_<128&&(k=_):V===2?(B=t[b+1],(B&192)===128&&(k=(_&31)<<6|B&63,k<=127&&(k=null))):V===3?(B=t[b+1],q=t[b+2],(B&192)===128&&(q&192)===128&&(k=(_&15)<<12|(B&63)<<6|q&63,(k<=2047||k>=55296&&k<=57343)&&(k=null))):V===4&&(B=t[b+1],q=t[b+2],on=t[b+3],(B&192)===128&&(q&192)===128&&(on&192)===128&&(k=(_&15)<<18|(B&63)<<12|(q&63)<<6|on&63,(k<=65535||k>=1114112)&&(k=null))),k===null?(k=65533,V=1):k>65535&&(k-=65536,v+=String.fromCharCode(k>>>10&1023|55296),k=56320|k&1023),v+=String.fromCharCode(k),b+=V}return v}function G(t,o,h){return l.decode(t.subarray(o,h))}function U(t,o,h){for(var v=0,b,_;v<o.length;v++){if(b=o.charCodeAt(v),b>55295&&b<57344)if(_)if(b<56320){t[h++]=239,t[h++]=191,t[h++]=189,_=b;continue}else b=_-55296<<10|b-56320|65536,_=null;else{b>56319||v+1===o.length?(t[h++]=239,t[h++]=191,t[h++]=189):_=b;continue}else _&&(t[h++]=239,t[h++]=191,t[h++]=189,_=null);b<128?t[h++]=b:(b<2048?t[h++]=b>>6|192:(b<65536?t[h++]=b>>12|224:(t[h++]=b>>18|240,t[h++]=b>>12&63|128),t[h++]=b>>6&63|128),t[h++]=b&63|128)}return h}return Y}var Z,cn;function pn(){if(cn)return Z;cn=1,Z=r;function r(n,e){this.x=n,this.y=e}return r.prototype={clone:function(){return new r(this.x,this.y)},add:function(n){return this.clone()._add(n)},sub:function(n){return this.clone()._sub(n)},multByPoint:function(n){return this.clone()._multByPoint(n)},divByPoint:function(n){return this.clone()._divByPoint(n)},mult:function(n){return this.clone()._mult(n)},div:function(n){return this.clone()._div(n)},rotate:function(n){return this.clone()._rotate(n)},rotateAround:function(n,e){return this.clone()._rotateAround(n,e)},matMult:function(n){return this.clone()._matMult(n)},unit:function(){return this.clone()._unit()},perp:function(){return this.clone()._perp()},round:function(){return this.clone()._round()},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals:function(n){return this.x===n.x&&this.y===n.y},dist:function(n){return Math.sqrt(this.distSqr(n))},distSqr:function(n){var e=n.x-this.x,s=n.y-this.y;return e*e+s*s},angle:function(){return Math.atan2(this.y,this.x)},angleTo:function(n){return Math.atan2(this.y-n.y,this.x-n.x)},angleWith:function(n){return this.angleWithSep(n.x,n.y)},angleWithSep:function(n,e){return Math.atan2(this.x*e-this.y*n,this.x*n+this.y*e)},_matMult:function(n){var e=n[0]*this.x+n[1]*this.y,s=n[2]*this.x+n[3]*this.y;return this.x=e,this.y=s,this},_add:function(n){return this.x+=n.x,this.y+=n.y,this},_sub:function(n){return this.x-=n.x,this.y-=n.y,this},_mult:function(n){return this.x*=n,this.y*=n,this},_div:function(n){return this.x/=n,this.y/=n,this},_multByPoint:function(n){return this.x*=n.x,this.y*=n.y,this},_divByPoint:function(n){return this.x/=n.x,this.y/=n.y,this},_unit:function(){return this._div(this.mag()),this},_perp:function(){var n=this.y;return this.y=this.x,this.x=-n,this},_rotate:function(n){var e=Math.cos(n),s=Math.sin(n),i=e*this.x-s*this.y,l=s*this.x+e*this.y;return this.x=i,this.y=l,this},_rotateAround:function(n,e){var s=Math.cos(n),i=Math.sin(n),l=e.x+s*(this.x-e.x)-i*(this.y-e.y),u=e.y+i*(this.x-e.x)+s*(this.y-e.y);return this.x=l,this.y=u,this},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},r.convert=function(n){return n instanceof r?n:Array.isArray(n)?new r(n[0],n[1]):n},Z}var H={},Q,dn;function gn(){if(dn)return Q;dn=1;var r=pn();Q=n;function n(u,d,c,g,y){this.properties={},this.extent=c,this.type=0,this._pbf=u,this._geometry=-1,this._keys=g,this._values=y,u.readFields(e,this,d)}function e(u,d,c){u==1?d.id=c.readVarint():u==2?s(c,d):u==3?d.type=c.readVarint():u==4&&(d._geometry=c.pos)}function s(u,d){for(var c=u.readVarint()+u.pos;u.pos<c;){var g=d._keys[u.readVarint()],y=d._values[u.readVarint()];d.properties[g]=y}}n.types=["Unknown","Point","LineString","Polygon"],n.prototype.loadGeometry=function(){var u=this._pbf;u.pos=this._geometry;for(var d=u.readVarint()+u.pos,c=1,g=0,y=0,x=0,a=[],f;u.pos<d;){if(g<=0){var p=u.readVarint();c=p&7,g=p>>3}if(g--,c===1||c===2)y+=u.readSVarint(),x+=u.readSVarint(),c===1&&(f&&a.push(f),f=[]),f.push(new r(y,x));else if(c===7)f&&f.push(f[0].clone());else throw new Error("unknown command "+c)}return f&&a.push(f),a},n.prototype.bbox=function(){var u=this._pbf;u.pos=this._geometry;for(var d=u.readVarint()+u.pos,c=1,g=0,y=0,x=0,a=1/0,f=-1/0,p=1/0,P=-1/0;u.pos<d;){if(g<=0){var m=u.readVarint();c=m&7,g=m>>3}if(g--,c===1||c===2)y+=u.readSVarint(),x+=u.readSVarint(),y<a&&(a=y),y>f&&(f=y),x<p&&(p=x),x>P&&(P=x);else if(c!==7)throw new Error("unknown command "+c)}return[a,p,f,P]},n.prototype.toGeoJSON=function(u,d,c){var g=this.extent*Math.pow(2,c),y=this.extent*u,x=this.extent*d,a=this.loadGeometry(),f=n.types[this.type],p,P;function m(A){for(var M=0;M<A.length;M++){var F=A[M],E=180-(F.y+x)*360/g;A[M]=[(F.x+y)*360/g-180,360/Math.PI*Math.atan(Math.exp(E*Math.PI/180))-90]}}switch(this.type){case 1:var S=[];for(p=0;p<a.length;p++)S[p]=a[p][0];a=S,m(a);break;case 2:for(p=0;p<a.length;p++)m(a[p]);break;case 3:for(a=i(a),p=0;p<a.length;p++)for(P=0;P<a[p].length;P++)m(a[p][P]);break}a.length===1?a=a[0]:f="Multi"+f;var w={type:"Feature",geometry:{type:f,coordinates:a},properties:this.properties};return"id"in this&&(w.id=this.id),w};function i(u){var d=u.length;if(d<=1)return[u];for(var c=[],g,y,x=0;x<d;x++){var a=l(u[x]);a!==0&&(y===void 0&&(y=a<0),y===a<0?(g&&c.push(g),g=[u[x]]):g.push(u[x]))}return g&&c.push(g),c}function l(u){for(var d=0,c=0,g=u.length,y=g-1,x,a;c<g;y=c++)x=u[c],a=u[y],d+=(a.x-x.x)*(x.y+a.y);return d}return Q}var nn,yn;function xn(){if(yn)return nn;yn=1;var r=gn();nn=n;function n(i,l){this.version=1,this.name=null,this.extent=4096,this.length=0,this._pbf=i,this._keys=[],this._values=[],this._features=[],i.readFields(e,this,l),this.length=this._features.length}function e(i,l,u){i===15?l.version=u.readVarint():i===1?l.name=u.readString():i===5?l.extent=u.readVarint():i===2?l._features.push(u.pos):i===3?l._keys.push(u.readString()):i===4&&l._values.push(s(u))}function s(i){for(var l=null,u=i.readVarint()+i.pos;i.pos<u;){var d=i.readVarint()>>3;l=d===1?i.readString():d===2?i.readFloat():d===3?i.readDouble():d===4?i.readVarint64():d===5?i.readVarint():d===6?i.readSVarint():d===7?i.readBoolean():null}return l}return n.prototype.feature=function(i){if(i<0||i>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[i];var l=this._pbf.readVarint()+this._pbf.pos;return new r(this._pbf,l,this.extent,this._keys,this._values)},nn}var en,mn;function te(){if(mn)return en;mn=1;var r=xn();en=n;function n(s,i){this.layers=s.readFields(e,{},i)}function e(s,i,l){if(s===3){var u=new r(l,l.readVarint()+l.pos);u.length&&(i[u.name]=u)}}return en}var wn;function re(){return wn||(wn=1,H.VectorTile=te(),H.VectorTileFeature=gn(),H.VectorTileLayer=xn()),H}var tn,bn;function ie(){if(bn)return tn;bn=1;var r=pn(),n=re().VectorTileFeature;tn=e;function e(i,l){this.options=l||{},this.features=i,this.length=i.length}e.prototype.feature=function(i){return new s(this.features[i],this.options.extent)};function s(i,l){this.id=typeof i.id=="number"?i.id:void 0,this.type=i.type,this.rawGeometry=i.type===1?[i.geometry]:i.geometry,this.properties=i.tags,this.extent=l||4096}return s.prototype.loadGeometry=function(){var i=this.rawGeometry;this.geometry=[];for(var l=0;l<i.length;l++){for(var u=i[l],d=[],c=0;c<u.length;c++)d.push(new r(u[c][0],u[c][1]));this.geometry.push(d)}return this.geometry},s.prototype.bbox=function(){this.geometry||this.loadGeometry();for(var i=this.geometry,l=1/0,u=-1/0,d=1/0,c=-1/0,g=0;g<i.length;g++)for(var y=i[g],x=0;x<y.length;x++){var a=y[x];l=Math.min(l,a.x),u=Math.max(u,a.x),d=Math.min(d,a.y),c=Math.max(c,a.y)}return[l,d,u,c]},s.prototype.toGeoJSON=n.prototype.toGeoJSON,tn}var vn;function se(){if(vn)return D.exports;vn=1;var r=ee(),n=ie();D.exports=e,D.exports.fromVectorTileJs=e,D.exports.fromGeojsonVt=s,D.exports.GeoJSONWrapper=n;function e(a){var f=new r;return i(a,f),f.finish()}function s(a,f){f=f||{};var p={};for(var P in a)p[P]=new n(a[P].features,f),p[P].name=P,p[P].version=f.version,p[P].extent=f.extent;return e({layers:p})}function i(a,f){for(var p in a.layers)f.writeMessage(3,l,a.layers[p])}function l(a,f){f.writeVarintField(15,a.version||1),f.writeStringField(1,a.name||""),f.writeVarintField(5,a.extent||4096);var p,P={keys:[],values:[],keycache:{},valuecache:{}};for(p=0;p<a.length;p++)P.feature=a.feature(p),f.writeMessage(2,u,P);var m=P.keys;for(p=0;p<m.length;p++)f.writeStringField(3,m[p]);var S=P.values;for(p=0;p<S.length;p++)f.writeMessage(4,x,S[p])}function u(a,f){var p=a.feature;p.id!==void 0&&f.writeVarintField(1,p.id),f.writeMessage(2,d,a),f.writeVarintField(3,p.type),f.writeMessage(4,y,p)}function d(a,f){var p=a.feature,P=a.keys,m=a.values,S=a.keycache,w=a.valuecache;for(var A in p.properties){var M=p.properties[A],F=S[A];if(M!==null){typeof F>"u"&&(P.push(A),F=P.length-1,S[A]=F),f.writeVarint(F);var E=typeof M;E!=="string"&&E!=="boolean"&&E!=="number"&&(M=JSON.stringify(M));var L=E+":"+M,T=w[L];typeof T>"u"&&(m.push(M),T=m.length-1,w[L]=T),f.writeVarint(T)}}}function c(a,f){return(f<<3)+(a&7)}function g(a){return a<<1^a>>31}function y(a,f){for(var p=a.loadGeometry(),P=a.type,m=0,S=0,w=p.length,A=0;A<w;A++){var M=p[A],F=1;P===1&&(F=M.length),f.writeVarint(c(1,F));for(var E=P===3?M.length-1:M.length,L=0;L<E;L++){L===1&&P!==1&&f.writeVarint(c(2,E-1));var T=M[L].x-m,O=M[L].y-S;f.writeVarint(g(T)),f.writeVarint(g(O)),m+=T,S+=O}P===3&&f.writeVarint(c(7,1))}}function x(a,f){var p=typeof a;p==="string"?f.writeStringField(1,a):p==="boolean"?f.writeBooleanField(7,a):p==="number"&&(a%1!==0?f.writeDoubleField(3,a):a<0?f.writeSVarintField(6,a):f.writeVarintField(5,a))}return D.exports}var oe=se();const Sn=Qn(oe),Pn=`var Xt = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Ye = Math.ceil, re = Math.floor, Q = "[BigNumber Error] ", ht = Q + "Number primitive has more than 15 significant digits: ", se = 1e14, G = 14, Je = 9007199254740991, We = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], ye = 1e7, X = 1e9;
function Ft(t) {
  var e, r, n, i = m.prototype = { constructor: m, toString: null, valueOf: null }, o = new m(1), l = 20, a = 4, h = -7, c = 21, M = -1e7, d = 1e7, E = !1, O = 1, v = 0, L = {
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
  function m(s, u) {
    var f, x, p, y, b, g, w, P, S = this;
    if (!(S instanceof m)) return new m(s, u);
    if (u == null) {
      if (s && s._isBigNumber === !0) {
        S.s = s.s, !s.c || s.e > d ? S.c = S.e = null : s.e < M ? S.c = [S.e = 0] : (S.e = s.e, S.c = s.c.slice());
        return;
      }
      if ((g = typeof s == "number") && s * 0 == 0) {
        if (S.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (y = 0, b = s; b >= 10; b /= 10, y++) ;
          y > d ? S.c = S.e = null : (S.e = y, S.c = [s]);
          return;
        }
        P = String(s);
      } else {
        if (!Xt.test(P = String(s))) return n(S, P, g);
        S.s = P.charCodeAt(0) == 45 ? (P = P.slice(1), -1) : 1;
      }
      (y = P.indexOf(".")) > -1 && (P = P.replace(".", "")), (b = P.search(/e/i)) > 0 ? (y < 0 && (y = b), y += +P.slice(b + 1), P = P.substring(0, b)) : y < 0 && (y = P.length);
    } else {
      if (U(u, 2, _.length, "Base"), u == 10 && A)
        return S = new m(s), C(S, l + S.e + 1, a);
      if (P = String(s), g = typeof s == "number") {
        if (s * 0 != 0) return n(S, P, g, u);
        if (S.s = 1 / s < 0 ? (P = P.slice(1), -1) : 1, m.DEBUG && P.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(ht + s);
      } else
        S.s = P.charCodeAt(0) === 45 ? (P = P.slice(1), -1) : 1;
      for (f = _.slice(0, u), y = b = 0, w = P.length; b < w; b++)
        if (f.indexOf(x = P.charAt(b)) < 0) {
          if (x == ".") {
            if (b > y) {
              y = w;
              continue;
            }
          } else if (!p && (P == P.toUpperCase() && (P = P.toLowerCase()) || P == P.toLowerCase() && (P = P.toUpperCase()))) {
            p = !0, b = -1, y = 0;
            continue;
          }
          return n(S, String(s), g, u);
        }
      g = !1, P = r(P, u, 10, S.s), (y = P.indexOf(".")) > -1 ? P = P.replace(".", "") : y = P.length;
    }
    for (b = 0; P.charCodeAt(b) === 48; b++) ;
    for (w = P.length; P.charCodeAt(--w) === 48; ) ;
    if (P = P.slice(b, ++w)) {
      if (w -= b, g && m.DEBUG && w > 15 && (s > Je || s !== re(s)))
        throw Error(ht + S.s * s);
      if ((y = y - b - 1) > d)
        S.c = S.e = null;
      else if (y < M)
        S.c = [S.e = 0];
      else {
        if (S.e = y, S.c = [], b = (y + 1) % G, y < 0 && (b += G), b < w) {
          for (b && S.c.push(+P.slice(0, b)), w -= G; b < w; )
            S.c.push(+P.slice(b, b += G));
          b = G - (P = P.slice(b)).length;
        } else
          b -= w;
        for (; b--; P += "0") ;
        S.c.push(+P);
      }
    } else
      S.c = [S.e = 0];
  }
  m.clone = Ft, m.ROUND_UP = 0, m.ROUND_DOWN = 1, m.ROUND_CEIL = 2, m.ROUND_FLOOR = 3, m.ROUND_HALF_UP = 4, m.ROUND_HALF_DOWN = 5, m.ROUND_HALF_EVEN = 6, m.ROUND_HALF_CEIL = 7, m.ROUND_HALF_FLOOR = 8, m.EUCLID = 9, m.config = m.set = function(s) {
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
                E = f;
              else
                throw E = !f, Error(Q + "crypto unavailable");
            else
              E = f;
          else
            throw Error(Q + u + " not true or false: " + f);
        if (s.hasOwnProperty(u = "MODULO_MODE") && (f = s[u], U(f, 0, 9, u), O = f), s.hasOwnProperty(u = "POW_PRECISION") && (f = s[u], U(f, 0, X, u), v = f), s.hasOwnProperty(u = "FORMAT"))
          if (f = s[u], typeof f == "object") L = f;
          else throw Error(Q + u + " not an object: " + f);
        if (s.hasOwnProperty(u = "ALPHABET"))
          if (f = s[u], typeof f == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(f))
            A = f.slice(0, 10) == "0123456789", _ = f;
          else
            throw Error(Q + u + " invalid: " + f);
      } else
        throw Error(Q + "Object expected: " + s);
    return {
      DECIMAL_PLACES: l,
      ROUNDING_MODE: a,
      EXPONENTIAL_AT: [h, c],
      RANGE: [M, d],
      CRYPTO: E,
      MODULO_MODE: O,
      POW_PRECISION: v,
      FORMAT: L,
      ALPHABET: _
    };
  }, m.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!m.DEBUG) return !0;
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
  }, m.maximum = m.max = function() {
    return k(arguments, -1);
  }, m.minimum = m.min = function() {
    return k(arguments, 1);
  }, m.random = (function() {
    var s = 9007199254740992, u = Math.random() * s & 2097151 ? function() {
      return re(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(f) {
      var x, p, y, b, g, w = 0, P = [], S = new m(o);
      if (f == null ? f = l : U(f, 0, X), b = Ye(f / G), E)
        if (crypto.getRandomValues) {
          for (x = crypto.getRandomValues(new Uint32Array(b *= 2)); w < b; )
            g = x[w] * 131072 + (x[w + 1] >>> 11), g >= 9e15 ? (p = crypto.getRandomValues(new Uint32Array(2)), x[w] = p[0], x[w + 1] = p[1]) : (P.push(g % 1e14), w += 2);
          w = b / 2;
        } else if (crypto.randomBytes) {
          for (x = crypto.randomBytes(b *= 7); w < b; )
            g = (x[w] & 31) * 281474976710656 + x[w + 1] * 1099511627776 + x[w + 2] * 4294967296 + x[w + 3] * 16777216 + (x[w + 4] << 16) + (x[w + 5] << 8) + x[w + 6], g >= 9e15 ? crypto.randomBytes(7).copy(x, w) : (P.push(g % 1e14), w += 7);
          w = b / 7;
        } else
          throw E = !1, Error(Q + "crypto unavailable");
      if (!E)
        for (; w < b; )
          g = u(), g < 9e15 && (P[w++] = g % 1e14);
      for (b = P[--w], f %= G, b && f && (g = We[G - f], P[w] = re(b / g) * g); P[w] === 0; P.pop(), w--) ;
      if (w < 0)
        P = [y = 0];
      else {
        for (y = -1; P[0] === 0; P.splice(0, 1), y -= G) ;
        for (w = 1, g = P[0]; g >= 10; g /= 10, w++) ;
        w < G && (y -= G - w);
      }
      return S.e = y, S.c = P, S;
    };
  })(), m.sum = function() {
    for (var s = 1, u = arguments, f = new m(u[0]); s < u.length; ) f = f.plus(u[s++]);
    return f;
  }, r = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function u(f, x, p, y) {
      for (var b, g = [0], w, P = 0, S = f.length; P < S; ) {
        for (w = g.length; w--; g[w] *= x) ;
        for (g[0] += y.indexOf(f.charAt(P++)), b = 0; b < g.length; b++)
          g[b] > p - 1 && (g[b + 1] == null && (g[b + 1] = 0), g[b + 1] += g[b] / p | 0, g[b] %= p);
      }
      return g.reverse();
    }
    return function(f, x, p, y, b) {
      var g, w, P, S, T, B, I, D, V = f.indexOf("."), K = l, q = a;
      for (V >= 0 && (S = v, v = 0, f = f.replace(".", ""), D = new m(x), B = D.pow(f.length - V), v = S, D.c = u(
        ce(te(B.c), B.e, "0"),
        10,
        p,
        s
      ), D.e = D.c.length), I = u(f, x, p, b ? (g = _, s) : (g = s, _)), P = S = I.length; I[--S] == 0; I.pop()) ;
      if (!I[0]) return g.charAt(0);
      if (V < 0 ? --P : (B.c = I, B.e = P, B.s = y, B = e(B, D, K, q, p), I = B.c, T = B.r, P = B.e), w = P + K + 1, V = I[w], S = p / 2, T = T || w < 0 || I[w + 1] != null, T = q < 4 ? (V != null || T) && (q == 0 || q == (B.s < 0 ? 3 : 2)) : V > S || V == S && (q == 4 || T || q == 6 && I[w - 1] & 1 || q == (B.s < 0 ? 8 : 7)), w < 1 || !I[0])
        f = T ? ce(g.charAt(1), -K, g.charAt(0)) : g.charAt(0);
      else {
        if (I.length = w, T)
          for (--p; ++I[--w] > p; )
            I[w] = 0, w || (++P, I = [1].concat(I));
        for (S = I.length; !I[--S]; ) ;
        for (V = 0, f = ""; V <= S; f += g.charAt(I[V++])) ;
        f = ce(f, P, g.charAt(0));
      }
      return f;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(x, p, y) {
      var b, g, w, P, S = 0, T = x.length, B = p % ye, I = p / ye | 0;
      for (x = x.slice(); T--; )
        w = x[T] % ye, P = x[T] / ye | 0, b = I * w + P * B, g = B * w + b % ye * ye + S, S = (g / y | 0) + (b / ye | 0) + I * P, x[T] = g % y;
      return S && (x = [S].concat(x)), x;
    }
    function u(x, p, y, b) {
      var g, w;
      if (y != b)
        w = y > b ? 1 : -1;
      else
        for (g = w = 0; g < y; g++)
          if (x[g] != p[g]) {
            w = x[g] > p[g] ? 1 : -1;
            break;
          }
      return w;
    }
    function f(x, p, y, b) {
      for (var g = 0; y--; )
        x[y] -= g, g = x[y] < p[y] ? 1 : 0, x[y] = g * b + x[y] - p[y];
      for (; !x[0] && x.length > 1; x.splice(0, 1)) ;
    }
    return function(x, p, y, b, g) {
      var w, P, S, T, B, I, D, V, K, q, H, Y, Te, Ke, Xe, le, be, ee = x.s == p.s ? 1 : -1, W = x.c, $ = p.c;
      if (!W || !W[0] || !$ || !$[0])
        return new m(
          // Return NaN if either NaN, or both Infinity or 0.
          !x.s || !p.s || (W ? $ && W[0] == $[0] : !$) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            W && W[0] == 0 || !$ ? ee * 0 : ee / 0
          )
        );
      for (V = new m(ee), K = V.c = [], P = x.e - p.e, ee = y + P + 1, g || (g = se, P = ne(x.e / G) - ne(p.e / G), ee = ee / G | 0), S = 0; $[S] == (W[S] || 0); S++) ;
      if ($[S] > (W[S] || 0) && P--, ee < 0)
        K.push(1), T = !0;
      else {
        for (Ke = W.length, le = $.length, S = 0, ee += 2, B = re(g / ($[0] + 1)), B > 1 && ($ = s($, B, g), W = s(W, B, g), le = $.length, Ke = W.length), Te = le, q = W.slice(0, le), H = q.length; H < le; q[H++] = 0) ;
        be = $.slice(), be = [0].concat(be), Xe = $[0], $[1] >= g / 2 && Xe++;
        do {
          if (B = 0, w = u($, q, le, H), w < 0) {
            if (Y = q[0], le != H && (Y = Y * g + (q[1] || 0)), B = re(Y / Xe), B > 1)
              for (B >= g && (B = g - 1), I = s($, B, g), D = I.length, H = q.length; u(I, q, D, H) == 1; )
                B--, f(I, le < D ? be : $, D, g), D = I.length, w = 1;
            else
              B == 0 && (w = B = 1), I = $.slice(), D = I.length;
            if (D < H && (I = [0].concat(I)), f(q, I, H, g), H = q.length, w == -1)
              for (; u($, q, le, H) < 1; )
                B++, f(q, le < H ? be : $, H, g), H = q.length;
          } else w === 0 && (B++, q = [0]);
          K[S++] = B, q[0] ? q[H++] = W[Te] || 0 : (q = [W[Te]], H = 1);
        } while ((Te++ < Ke || q[0] != null) && ee--);
        T = q[0] != null, K[0] || K.splice(0, 1);
      }
      if (g == se) {
        for (S = 1, ee = K[0]; ee >= 10; ee /= 10, S++) ;
        C(V, y + (V.e = S + P * G - 1) + 1, b, T);
      } else
        V.e = P, V.r = +T;
      return V;
    };
  })();
  function F(s, u, f, x) {
    var p, y, b, g, w;
    if (f == null ? f = a : U(f, 0, 8), !s.c) return s.toString();
    if (p = s.c[0], b = s.e, u == null)
      w = te(s.c), w = x == 1 || x == 2 && (b <= h || b >= c) ? Re(w, b) : ce(w, b, "0");
    else if (s = C(new m(s), u, f), y = s.e, w = te(s.c), g = w.length, x == 1 || x == 2 && (u <= y || y <= h)) {
      for (; g < u; w += "0", g++) ;
      w = Re(w, y);
    } else if (u -= b + (x === 2 && y > b), w = ce(w, y, "0"), y + 1 > g) {
      if (--u > 0) for (w += "."; u--; w += "0") ;
    } else if (u += y - g, u > 0)
      for (y + 1 == g && (w += "."); u--; w += "0") ;
    return s.s < 0 && p ? "-" + w : w;
  }
  function k(s, u) {
    for (var f, x, p = 1, y = new m(s[0]); p < s.length; p++)
      x = new m(s[p]), (!x.s || (f = de(y, x)) === u || f === 0 && y.s === u) && (y = x);
    return y;
  }
  function N(s, u, f) {
    for (var x = 1, p = u.length; !u[--p]; u.pop()) ;
    for (p = u[0]; p >= 10; p /= 10, x++) ;
    return (f = x + f * G - 1) > d ? s.c = s.e = null : f < M ? s.c = [s.e = 0] : (s.e = f, s.c = u), s;
  }
  n = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, u = /^([^.]+)\\.$/, f = /^\\.([^.]+)$/, x = /^-?(Infinity|NaN)$/, p = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(y, b, g, w) {
      var P, S = g ? b : b.replace(p, "");
      if (x.test(S))
        y.s = isNaN(S) ? null : S < 0 ? -1 : 1;
      else {
        if (!g && (S = S.replace(s, function(T, B, I) {
          return P = (I = I.toLowerCase()) == "x" ? 16 : I == "b" ? 2 : 8, !w || w == P ? B : T;
        }), w && (P = w, S = S.replace(u, "$1").replace(f, "0.$1")), b != S))
          return new m(S, P);
        if (m.DEBUG)
          throw Error(Q + "Not a" + (w ? " base " + w : "") + " number: " + b);
        y.s = null;
      }
      y.c = y.e = null;
    };
  })();
  function C(s, u, f, x) {
    var p, y, b, g, w, P, S, T = s.c, B = We;
    if (T) {
      e: {
        for (p = 1, g = T[0]; g >= 10; g /= 10, p++) ;
        if (y = u - p, y < 0)
          y += G, b = u, w = T[P = 0], S = re(w / B[p - b - 1] % 10);
        else if (P = Ye((y + 1) / G), P >= T.length)
          if (x) {
            for (; T.length <= P; T.push(0)) ;
            w = S = 0, p = 1, y %= G, b = y - G + 1;
          } else
            break e;
        else {
          for (w = g = T[P], p = 1; g >= 10; g /= 10, p++) ;
          y %= G, b = y - G + p, S = b < 0 ? 0 : re(w / B[p - b - 1] % 10);
        }
        if (x = x || u < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        T[P + 1] != null || (b < 0 ? w : w % B[p - b - 1]), x = f < 4 ? (S || x) && (f == 0 || f == (s.s < 0 ? 3 : 2)) : S > 5 || S == 5 && (f == 4 || x || f == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? b > 0 ? w / B[p - b] : 0 : T[P - 1]) % 10 & 1 || f == (s.s < 0 ? 8 : 7)), u < 1 || !T[0])
          return T.length = 0, x ? (u -= s.e + 1, T[0] = B[(G - u % G) % G], s.e = -u || 0) : T[0] = s.e = 0, s;
        if (y == 0 ? (T.length = P, g = 1, P--) : (T.length = P + 1, g = B[G - y], T[P] = b > 0 ? re(w / B[p - b] % B[b]) * g : 0), x)
          for (; ; )
            if (P == 0) {
              for (y = 1, b = T[0]; b >= 10; b /= 10, y++) ;
              for (b = T[0] += g, g = 1; b >= 10; b /= 10, g++) ;
              y != g && (s.e++, T[0] == se && (T[0] = 1));
              break;
            } else {
              if (T[P] += g, T[P] != se) break;
              T[P--] = 0, g = 1;
            }
        for (y = T.length; T[--y] === 0; T.pop()) ;
      }
      s.e > d ? s.c = s.e = null : s.e < M && (s.c = [s.e = 0]);
    }
    return s;
  }
  function R(s) {
    var u, f = s.e;
    return f === null ? s.toString() : (u = te(s.c), u = f <= h || f >= c ? Re(u, f) : ce(u, f, "0"), s.s < 0 ? "-" + u : u);
  }
  return i.absoluteValue = i.abs = function() {
    var s = new m(this);
    return s.s < 0 && (s.s = 1), s;
  }, i.comparedTo = function(s, u) {
    return de(this, new m(s, u));
  }, i.decimalPlaces = i.dp = function(s, u) {
    var f, x, p, y = this;
    if (s != null)
      return U(s, 0, X), u == null ? u = a : U(u, 0, 8), C(new m(y), s + y.e + 1, u);
    if (!(f = y.c)) return null;
    if (x = ((p = f.length - 1) - ne(this.e / G)) * G, p = f[p]) for (; p % 10 == 0; p /= 10, x--) ;
    return x < 0 && (x = 0), x;
  }, i.dividedBy = i.div = function(s, u) {
    return e(this, new m(s, u), l, a);
  }, i.dividedToIntegerBy = i.idiv = function(s, u) {
    return e(this, new m(s, u), 0, 1);
  }, i.exponentiatedBy = i.pow = function(s, u) {
    var f, x, p, y, b, g, w, P, S, T = this;
    if (s = new m(s), s.c && !s.isInteger())
      throw Error(Q + "Exponent not an integer: " + R(s));
    if (u != null && (u = new m(u)), g = s.e > 14, !T.c || !T.c[0] || T.c[0] == 1 && !T.e && T.c.length == 1 || !s.c || !s.c[0])
      return S = new m(Math.pow(+R(T), g ? s.s * (2 - Ce(s)) : +R(s))), u ? S.mod(u) : S;
    if (w = s.s < 0, u) {
      if (u.c ? !u.c[0] : !u.s) return new m(NaN);
      x = !w && T.isInteger() && u.isInteger(), x && (T = T.mod(u));
    } else {
      if (s.e > 9 && (T.e > 0 || T.e < -1 || (T.e == 0 ? T.c[0] > 1 || g && T.c[1] >= 24e7 : T.c[0] < 8e13 || g && T.c[0] <= 9999975e7)))
        return y = T.s < 0 && Ce(s) ? -0 : 0, T.e > -1 && (y = 1 / y), new m(w ? 1 / y : y);
      v && (y = Ye(v / G + 2));
    }
    for (g ? (f = new m(0.5), w && (s.s = 1), P = Ce(s)) : (p = Math.abs(+R(s)), P = p % 2), S = new m(o); ; ) {
      if (P) {
        if (S = S.times(T), !S.c) break;
        y ? S.c.length > y && (S.c.length = y) : x && (S = S.mod(u));
      }
      if (p) {
        if (p = re(p / 2), p === 0) break;
        P = p % 2;
      } else if (s = s.times(f), C(s, s.e + 1, 1), s.e > 14)
        P = Ce(s);
      else {
        if (p = +R(s), p === 0) break;
        P = p % 2;
      }
      T = T.times(T), y ? T.c && T.c.length > y && (T.c.length = y) : x && (T = T.mod(u));
    }
    return x ? S : (w && (S = o.div(S)), u ? S.mod(u) : y ? C(S, v, a, b) : S);
  }, i.integerValue = function(s) {
    var u = new m(this);
    return s == null ? s = a : U(s, 0, 8), C(u, u.e + 1, s);
  }, i.isEqualTo = i.eq = function(s, u) {
    return de(this, new m(s, u)) === 0;
  }, i.isFinite = function() {
    return !!this.c;
  }, i.isGreaterThan = i.gt = function(s, u) {
    return de(this, new m(s, u)) > 0;
  }, i.isGreaterThanOrEqualTo = i.gte = function(s, u) {
    return (u = de(this, new m(s, u))) === 1 || u === 0;
  }, i.isInteger = function() {
    return !!this.c && ne(this.e / G) > this.c.length - 2;
  }, i.isLessThan = i.lt = function(s, u) {
    return de(this, new m(s, u)) < 0;
  }, i.isLessThanOrEqualTo = i.lte = function(s, u) {
    return (u = de(this, new m(s, u))) === -1 || u === 0;
  }, i.isNaN = function() {
    return !this.s;
  }, i.isNegative = function() {
    return this.s < 0;
  }, i.isPositive = function() {
    return this.s > 0;
  }, i.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, i.minus = function(s, u) {
    var f, x, p, y, b = this, g = b.s;
    if (s = new m(s, u), u = s.s, !g || !u) return new m(NaN);
    if (g != u)
      return s.s = -u, b.plus(s);
    var w = b.e / G, P = s.e / G, S = b.c, T = s.c;
    if (!w || !P) {
      if (!S || !T) return S ? (s.s = -u, s) : new m(T ? b : NaN);
      if (!S[0] || !T[0])
        return T[0] ? (s.s = -u, s) : new m(S[0] ? b : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          a == 3 ? -0 : 0
        ));
    }
    if (w = ne(w), P = ne(P), S = S.slice(), g = w - P) {
      for ((y = g < 0) ? (g = -g, p = S) : (P = w, p = T), p.reverse(), u = g; u--; p.push(0)) ;
      p.reverse();
    } else
      for (x = (y = (g = S.length) < (u = T.length)) ? g : u, g = u = 0; u < x; u++)
        if (S[u] != T[u]) {
          y = S[u] < T[u];
          break;
        }
    if (y && (p = S, S = T, T = p, s.s = -s.s), u = (x = T.length) - (f = S.length), u > 0) for (; u--; S[f++] = 0) ;
    for (u = se - 1; x > g; ) {
      if (S[--x] < T[x]) {
        for (f = x; f && !S[--f]; S[f] = u) ;
        --S[f], S[x] += se;
      }
      S[x] -= T[x];
    }
    for (; S[0] == 0; S.splice(0, 1), --P) ;
    return S[0] ? N(s, S, P) : (s.s = a == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, i.modulo = i.mod = function(s, u) {
    var f, x, p = this;
    return s = new m(s, u), !p.c || !s.s || s.c && !s.c[0] ? new m(NaN) : !s.c || p.c && !p.c[0] ? new m(p) : (O == 9 ? (x = s.s, s.s = 1, f = e(p, s, 0, 3), s.s = x, f.s *= x) : f = e(p, s, 0, O), s = p.minus(f.times(s)), !s.c[0] && O == 1 && (s.s = p.s), s);
  }, i.multipliedBy = i.times = function(s, u) {
    var f, x, p, y, b, g, w, P, S, T, B, I, D, V, K, q = this, H = q.c, Y = (s = new m(s, u)).c;
    if (!H || !Y || !H[0] || !Y[0])
      return !q.s || !s.s || H && !H[0] && !Y || Y && !Y[0] && !H ? s.c = s.e = s.s = null : (s.s *= q.s, !H || !Y ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (x = ne(q.e / G) + ne(s.e / G), s.s *= q.s, w = H.length, T = Y.length, w < T && (D = H, H = Y, Y = D, p = w, w = T, T = p), p = w + T, D = []; p--; D.push(0)) ;
    for (V = se, K = ye, p = T; --p >= 0; ) {
      for (f = 0, B = Y[p] % K, I = Y[p] / K | 0, b = w, y = p + b; y > p; )
        P = H[--b] % K, S = H[b] / K | 0, g = I * P + S * B, P = B * P + g % K * K + D[y] + f, f = (P / V | 0) + (g / K | 0) + I * S, D[y--] = P % V;
      D[y] = f;
    }
    return f ? ++x : D.splice(0, 1), N(s, D, x);
  }, i.negated = function() {
    var s = new m(this);
    return s.s = -s.s || null, s;
  }, i.plus = function(s, u) {
    var f, x = this, p = x.s;
    if (s = new m(s, u), u = s.s, !p || !u) return new m(NaN);
    if (p != u)
      return s.s = -u, x.minus(s);
    var y = x.e / G, b = s.e / G, g = x.c, w = s.c;
    if (!y || !b) {
      if (!g || !w) return new m(p / 0);
      if (!g[0] || !w[0]) return w[0] ? s : new m(g[0] ? x : p * 0);
    }
    if (y = ne(y), b = ne(b), g = g.slice(), p = y - b) {
      for (p > 0 ? (b = y, f = w) : (p = -p, f = g), f.reverse(); p--; f.push(0)) ;
      f.reverse();
    }
    for (p = g.length, u = w.length, p - u < 0 && (f = w, w = g, g = f, u = p), p = 0; u; )
      p = (g[--u] = g[u] + w[u] + p) / se | 0, g[u] = se === g[u] ? 0 : g[u] % se;
    return p && (g = [p].concat(g), ++b), N(s, g, b);
  }, i.precision = i.sd = function(s, u) {
    var f, x, p, y = this;
    if (s != null && s !== !!s)
      return U(s, 1, X), u == null ? u = a : U(u, 0, 8), C(new m(y), s, u);
    if (!(f = y.c)) return null;
    if (p = f.length - 1, x = p * G + 1, p = f[p]) {
      for (; p % 10 == 0; p /= 10, x--) ;
      for (p = f[0]; p >= 10; p /= 10, x++) ;
    }
    return s && y.e + 1 > x && (x = y.e + 1), x;
  }, i.shiftedBy = function(s) {
    return U(s, -Je, Je), this.times("1e" + s);
  }, i.squareRoot = i.sqrt = function() {
    var s, u, f, x, p, y = this, b = y.c, g = y.s, w = y.e, P = l + 4, S = new m("0.5");
    if (g !== 1 || !b || !b[0])
      return new m(!g || g < 0 && (!b || b[0]) ? NaN : b ? y : 1 / 0);
    if (g = Math.sqrt(+R(y)), g == 0 || g == 1 / 0 ? (u = te(b), (u.length + w) % 2 == 0 && (u += "0"), g = Math.sqrt(+u), w = ne((w + 1) / 2) - (w < 0 || w % 2), g == 1 / 0 ? u = "5e" + w : (u = g.toExponential(), u = u.slice(0, u.indexOf("e") + 1) + w), f = new m(u)) : f = new m(g + ""), f.c[0]) {
      for (w = f.e, g = w + P, g < 3 && (g = 0); ; )
        if (p = f, f = S.times(p.plus(e(y, p, P, 1))), te(p.c).slice(0, g) === (u = te(f.c)).slice(0, g))
          if (f.e < w && --g, u = u.slice(g - 3, g + 1), u == "9999" || !x && u == "4999") {
            if (!x && (C(p, p.e + l + 2, 0), p.times(p).eq(y))) {
              f = p;
              break;
            }
            P += 4, g += 4, x = 1;
          } else {
            (!+u || !+u.slice(1) && u.charAt(0) == "5") && (C(f, f.e + l + 2, 1), s = !f.times(f).eq(y));
            break;
          }
    }
    return C(f, f.e + l + 1, a, s);
  }, i.toExponential = function(s, u) {
    return s != null && (U(s, 0, X), s++), F(this, s, u, 1);
  }, i.toFixed = function(s, u) {
    return s != null && (U(s, 0, X), s = s + this.e + 1), F(this, s, u);
  }, i.toFormat = function(s, u, f) {
    var x, p = this;
    if (f == null)
      s != null && u && typeof u == "object" ? (f = u, u = null) : s && typeof s == "object" ? (f = s, s = u = null) : f = L;
    else if (typeof f != "object")
      throw Error(Q + "Argument not an object: " + f);
    if (x = p.toFixed(s, u), p.c) {
      var y, b = x.split("."), g = +f.groupSize, w = +f.secondaryGroupSize, P = f.groupSeparator || "", S = b[0], T = b[1], B = p.s < 0, I = B ? S.slice(1) : S, D = I.length;
      if (w && (y = g, g = w, w = y, D -= y), g > 0 && D > 0) {
        for (y = D % g || g, S = I.substr(0, y); y < D; y += g) S += P + I.substr(y, g);
        w > 0 && (S += P + I.slice(y)), B && (S = "-" + S);
      }
      x = T ? S + (f.decimalSeparator || "") + ((w = +f.fractionGroupSize) ? T.replace(
        new RegExp("\\\\d{" + w + "}\\\\B", "g"),
        "$&" + (f.fractionGroupSeparator || "")
      ) : T) : S;
    }
    return (f.prefix || "") + x + (f.suffix || "");
  }, i.toFraction = function(s) {
    var u, f, x, p, y, b, g, w, P, S, T, B, I = this, D = I.c;
    if (s != null && (g = new m(s), !g.isInteger() && (g.c || g.s !== 1) || g.lt(o)))
      throw Error(Q + "Argument " + (g.isInteger() ? "out of range: " : "not an integer: ") + R(g));
    if (!D) return new m(I);
    for (u = new m(o), P = f = new m(o), x = w = new m(o), B = te(D), y = u.e = B.length - I.e - 1, u.c[0] = We[(b = y % G) < 0 ? G + b : b], s = !s || g.comparedTo(u) > 0 ? y > 0 ? u : P : g, b = d, d = 1 / 0, g = new m(B), w.c[0] = 0; S = e(g, u, 0, 1), p = f.plus(S.times(x)), p.comparedTo(s) != 1; )
      f = x, x = p, P = w.plus(S.times(p = P)), w = p, u = g.minus(S.times(p = u)), g = p;
    return p = e(s.minus(f), x, 0, 1), w = w.plus(p.times(P)), f = f.plus(p.times(x)), w.s = P.s = I.s, y = y * 2, T = e(P, x, y, a).minus(I).abs().comparedTo(
      e(w, f, y, a).minus(I).abs()
    ) < 1 ? [P, x] : [w, f], d = b, T;
  }, i.toNumber = function() {
    return +R(this);
  }, i.toPrecision = function(s, u) {
    return s != null && U(s, 1, X), F(this, s, u, 2);
  }, i.toString = function(s) {
    var u, f = this, x = f.s, p = f.e;
    return p === null ? x ? (u = "Infinity", x < 0 && (u = "-" + u)) : u = "NaN" : (s == null ? u = p <= h || p >= c ? Re(te(f.c), p) : ce(te(f.c), p, "0") : s === 10 && A ? (f = C(new m(f), l + p + 1, a), u = ce(te(f.c), f.e, "0")) : (U(s, 2, _.length, "Base"), u = r(ce(te(f.c), p, "0"), 10, s, x, !0)), x < 0 && f.c[0] && (u = "-" + u)), u;
  }, i.valueOf = i.toJSON = function() {
    return R(this);
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
var fe = Ft(), Yt = class {
  key;
  left = null;
  right = null;
  constructor(t) {
    this.key = t;
  }
}, Ee = class extends Yt {
  constructor(t) {
    super(t);
  }
}, Jt = class {
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
}, qe = class Me extends Jt {
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
    return new Zt(this.wrap());
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
}, Bt = class {
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
}, Wt = class extends Bt {
  getValue(t) {
    return t.key;
  }
}, Zt = class extends Bt {
  getValue(t) {
    return [t.key, t.key];
  }
}, It = (t) => () => t, rt = (t) => {
  const e = t ? (r, n) => n.minus(r).abs().isLessThanOrEqualTo(t) : It(!1);
  return (r, n) => e(r, n) ? 0 : r.comparedTo(n);
};
function Qt(t) {
  const e = t ? (r, n, i, o, l) => r.exponentiatedBy(2).isLessThanOrEqualTo(
    o.minus(n).exponentiatedBy(2).plus(l.minus(i).exponentiatedBy(2)).times(t)
  ) : It(!1);
  return (r, n, i) => {
    const o = r.x, l = r.y, a = i.x, h = i.y, c = l.minus(h).times(n.x.minus(a)).minus(o.minus(a).times(n.y.minus(h)));
    return e(c, o, l, a, h) ? 0 : c.comparedTo(0);
  };
}
var jt = (t) => t, er = (t) => {
  if (t) {
    const e = new qe(rt(t)), r = new qe(rt(t)), n = (o, l) => l.addAndReturn(o), i = (o) => ({
      x: n(o.x, e),
      y: n(o.y, r)
    });
    return i({ x: new fe(0), y: new fe(0) }), i;
  }
  return jt;
}, nt = (t) => ({
  set: (e) => {
    pe = nt(e);
  },
  reset: () => nt(t),
  compare: rt(t),
  snap: er(t),
  orient: Qt(t)
}), pe = nt(), Se = (t, e) => t.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(t.ur.x) && t.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(t.ur.y), it = (t, e) => {
  if (e.ur.x.isLessThan(t.ll.x) || t.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(t.ll.y) || t.ur.y.isLessThan(e.ll.y))
    return null;
  const r = t.ll.x.isLessThan(e.ll.x) ? e.ll.x : t.ll.x, n = t.ur.x.isLessThan(e.ur.x) ? t.ur.x : e.ur.x, i = t.ll.y.isLessThan(e.ll.y) ? e.ll.y : t.ll.y, o = t.ur.y.isLessThan(e.ur.y) ? t.ur.y : e.ur.y;
  return { ll: { x: r, y: i }, ur: { x: n, y: o } };
}, Be = (t, e) => t.x.times(e.y).minus(t.y.times(e.x)), Gt = (t, e) => t.x.times(e.x).plus(t.y.times(e.y)), De = (t) => Gt(t, t).sqrt(), tr = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return Be(i, n).div(De(i)).div(De(n));
}, rr = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return Gt(i, n).div(De(i)).div(De(n));
}, pt = (t, e, r) => e.y.isZero() ? null : { x: t.x.plus(e.x.div(e.y).times(r.minus(t.y))), y: r }, gt = (t, e, r) => e.x.isZero() ? null : { x: r, y: t.y.plus(e.y.div(e.x).times(r.minus(t.x))) }, nr = (t, e, r, n) => {
  if (e.x.isZero()) return gt(r, n, t.x);
  if (n.x.isZero()) return gt(t, e, r.x);
  if (e.y.isZero()) return pt(r, n, t.y);
  if (n.y.isZero()) return pt(t, e, r.y);
  const i = Be(e, n);
  if (i.isZero()) return null;
  const o = { x: r.x.minus(t.x), y: r.y.minus(t.y) }, l = Be(o, e).div(i), a = Be(o, n).div(i), h = t.x.plus(a.times(e.x)), c = r.x.plus(l.times(n.x)), M = t.y.plus(a.times(e.y)), d = r.y.plus(l.times(n.y)), E = h.plus(c).div(2), O = M.plus(d).div(2);
  return { x: E, y: O };
}, ae = class qt {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, r) {
    const n = qt.comparePoints(e.point, r.point);
    return n !== 0 ? n : (e.point !== r.point && e.link(r), e.isLeft !== r.isLeft ? e.isLeft ? 1 : -1 : He.compare(e.segment, r.segment));
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
        sine: tr(this.point, e.point, o.point),
        cosine: rr(this.point, e.point, o.point)
      });
    };
    return (i, o) => {
      r.has(i) || n(i), r.has(o) || n(o);
      const { sine: l, cosine: a } = r.get(i), { sine: h, cosine: c } = r.get(o);
      return l.isGreaterThanOrEqualTo(0) && h.isGreaterThanOrEqualTo(0) ? a.isLessThan(c) ? 1 : a.isGreaterThan(c) ? -1 : 0 : l.isLessThan(0) && h.isLessThan(0) ? a.isLessThan(c) ? -1 : a.isGreaterThan(c) ? 1 : 0 : h.isLessThan(l) ? -1 : h.isGreaterThan(l) ? 1 : 0;
    };
  }
}, ir = class st {
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
          const E = a.getAvailableLinkedEvents();
          if (E.length === 0) {
            const L = c[0].point, _ = c[c.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${L.x}, \${L.y}]. Last matching segment found ends at [\${_.x}, \${_.y}].\`
            );
          }
          if (E.length === 1) {
            h = E[0].otherSE;
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
            _.unshift(_[0].otherSE), r.push(new st(_.reverse()));
            continue;
          }
          d.push({
            index: c.length,
            point: a.point
          });
          const v = a.getLeftmostComparator(l);
          h = E.sort(v)[0].otherSE;
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
      const d = this.events[c].point, E = this.events[c + 1].point;
      pe.orient(d, e, E) !== 0 && (r.push(d), e = d);
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
}, sr = class {
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
}, or = class {
  queue;
  tree;
  segments;
  constructor(t, e = He.compare) {
    this.queue = t, this.tree = new qe(e), this.segments = [];
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
}, lr = class {
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
        for (let E = c + 1, O = n.length; E < O; E++)
          if (it(d.bbox, n[E].bbox) === null) return [];
      }
    const i = new qe(ae.compare);
    for (let c = 0, M = n.length; c < M; c++) {
      const d = n[c].getSweepEvents();
      for (let E = 0, O = d.length; E < O; E++)
        i.add(d[E]);
    }
    const o = new or(i);
    let l = null;
    for (i.size != 0 && (l = i.first(), i.delete(l)); l; ) {
      const c = o.process(l);
      for (let M = 0, d = c.length; M < d; M++) {
        const E = c[M];
        E.consumedBy === void 0 && i.add(E);
      }
      i.size != 0 ? (l = i.first(), i.delete(l)) : l = null;
    }
    pe.reset();
    const a = ir.factory(o.segments);
    return new sr(a).getGeom();
  }
}, Le = new lr(), ot = Le, ur = 0, He = class Ie {
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
      const E = r.comparePoint(e.rightSE.point);
      return E !== 0 ? E : -1;
    }
    if (n.isGreaterThan(i)) {
      if (a.isLessThan(h) && a.isLessThan(M)) return -1;
      if (a.isGreaterThan(h) && a.isGreaterThan(M)) return 1;
      const d = r.comparePoint(e.leftSE.point);
      if (d !== 0) return d;
      const E = e.comparePoint(r.rightSE.point);
      return E < 0 ? 1 : E > 0 ? -1 : 1;
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
      const d = c.minus(a), E = o.minus(n), O = M.minus(h), v = l.minus(i);
      if (d.isGreaterThan(E) && O.isLessThan(v)) return 1;
      if (d.isLessThan(E) && O.isGreaterThan(v)) return -1;
    }
    return o.isGreaterThan(l) ? 1 : o.isLessThan(l) || c.isLessThan(M) ? -1 : c.isGreaterThan(M) ? 1 : e.id < r.id ? -1 : e.id > r.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, r, n, i) {
    this.id = ++ur, this.leftSE = e, e.segment = this, e.otherSE = r, this.rightSE = r, r.segment = this, r.otherSE = e, this.rings = n, this.windings = i;
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
    return new Ie(h, c, [n], [l]);
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
    const o = this.leftSE.point, l = this.rightSE.point, a = e.leftSE.point, h = e.rightSE.point, c = Se(r, a) && this.comparePoint(a) === 0, M = Se(n, o) && e.comparePoint(o) === 0, d = Se(r, h) && this.comparePoint(h) === 0, E = Se(n, l) && e.comparePoint(l) === 0;
    if (M && c)
      return E && !d ? l : !E && d ? h : null;
    if (M)
      return d && o.x.eq(h.x) && o.y.eq(h.y) ? null : o;
    if (c)
      return E && l.x.eq(a.x) && l.y.eq(a.y) ? null : a;
    if (E && d) return null;
    if (E) return l;
    if (d) return h;
    const O = nr(o, this.vector(), a, e.vector());
    return O === null || !Se(i, O) ? null : pe.snap(O);
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
    const a = new Ie(
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
    const i = Ie.compare(r, n);
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
      a.x.eq(i.x) && a.y.eq(i.y) || (this.segments.push(He.fromRing(i, a, this)), a.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = a.x), a.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = a.y), a.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = a.x), a.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = a.y), i = a);
    }
    (!n.x.eq(i.x) || !n.y.eq(i.y)) && this.segments.push(He.fromRing(i, n, this));
  }
  getSweepEvents() {
    const t = [];
    for (let e = 0, r = this.segments.length; e < r; e++) {
      const n = this.segments[e];
      t.push(n.leftSE), t.push(n.rightSE);
    }
    return t;
  }
}, ar = class {
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
      const i = new ar(t[r], this);
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
}, fr = (t, ...e) => ot.run("union", t, e);
pe.set;
var j = 63710088e-1, cr = {
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
function hr(t, e, r = {}) {
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
function pr(t, e, r = {}) {
  return ge({
    type: "MultiPolygon",
    coordinates: t
  }, e, r);
}
function gr(t, e = "kilometers") {
  const r = cr[e];
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
function yr(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function Oe(t, e, r) {
  if (t !== null)
    for (var n, i, o, l, a, h, c, M = 0, d = 0, E, O = t.type, v = O === "FeatureCollection", L = O === "Feature", _ = v ? t.features.length : 1, A = 0; A < _; A++) {
      c = v ? (
        // @ts-expect-error: Known type conflict
        t.features[A].geometry
      ) : L ? (
        // @ts-expect-error: Known type conflict
        t.geometry
      ) : t, E = c ? c.type === "GeometryCollection" : !1, a = E ? c.geometries.length : 1;
      for (var m = 0; m < a; m++) {
        var F = 0, k = 0;
        if (l = E ? c.geometries[m] : c, l !== null) {
          h = l.coordinates;
          var N = l.type;
          switch (M = 0, N) {
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
                  k
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
                    k
                  ) === !1
                )
                  return !1;
                d++, N === "MultiPoint" && F++;
              }
              N === "LineString" && F++;
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
                      k
                    ) === !1
                  )
                    return !1;
                  d++;
                }
                N === "MultiLineString" && F++, N === "Polygon" && k++;
              }
              N === "Polygon" && F++;
              break;
            case "MultiPolygon":
              for (n = 0; n < h.length; n++) {
                for (k = 0, i = 0; i < h[n].length; i++) {
                  for (o = 0; o < h[n][i].length - M; o++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      e(
                        h[n][i][o],
                        d,
                        A,
                        F,
                        k
                      ) === !1
                    )
                      return !1;
                    d++;
                  }
                  k++;
                }
                F++;
              }
              break;
            case "GeometryCollection":
              for (n = 0; n < l.geometries.length; n++)
                if (
                  // @ts-expect-error: Known type conflict
                  Oe(l.geometries[n], e) === !1
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
  var r, n, i, o, l, a, h, c, M, d, E = 0, O = t.type === "FeatureCollection", v = t.type === "Feature", L = O ? t.features.length : 1;
  for (r = 0; r < L; r++) {
    for (a = O ? (
      // @ts-expect-error: Known type conflict
      t.features[r].geometry
    ) : v ? (
      // @ts-expect-error: Known type conflict
      t.geometry
    ) : t, c = O ? (
      // @ts-expect-error: Known type conflict
      t.features[r].properties
    ) : v ? (
      // @ts-expect-error: Known type conflict
      t.properties
    ) : {}, M = O ? (
      // @ts-expect-error: Known type conflict
      t.features[r].bbox
    ) : v ? (
      // @ts-expect-error: Known type conflict
      t.bbox
    ) : void 0, d = O ? (
      // @ts-expect-error: Known type conflict
      t.features[r].id
    ) : v ? (
      // @ts-expect-error: Known type conflict
      t.id
    ) : void 0, h = a ? a.type === "GeometryCollection" : !1, l = h ? a.geometries.length : 1, i = 0; i < l; i++) {
      if (o = h ? a.geometries[i] : a, o === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            E,
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
              E,
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
                E,
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
    E++;
  }
}
function dr(t, e) {
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
function mr(t, e = {}) {
  const r = [];
  if (ft(t, (i) => {
    r.push(i.coordinates);
  }), r.length < 2)
    throw new Error("Must have at least 2 geometries");
  const n = fr(r[0], ...r.slice(1));
  return n.length === 0 ? null : n.length === 1 ? hr(n[0], e.properties) : pr(n, e.properties);
}
function wr(t) {
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
function Ze(t) {
  if (!t) throw new Error("geojson is required");
  var e = [];
  return dr(t, function(r) {
    e.push(r);
  }), ve(e);
}
class xr {
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
function vr(t, e = 1, r = !1) {
  let n = 1 / 0, i = 1 / 0, o = -1 / 0, l = -1 / 0;
  for (const [A, m] of t[0])
    A < n && (n = A), m < i && (i = m), A > o && (o = A), m > l && (l = m);
  const a = o - n, h = l - i, c = Math.max(e, Math.min(a, h));
  if (c === e) {
    const A = [n, i];
    return A.distance = 0, A;
  }
  const M = new xr([], (A, m) => m.max - A.max);
  let d = Er(t);
  const E = new Ue(n + a / 2, i + h / 2, 0, t);
  E.d > d.d && (d = E);
  let O = 2;
  function v(A, m, F) {
    const k = new Ue(A, m, F, t);
    O++, k.max > d.d + e && M.push(k), k.d > d.d && (d = k, r && console.log(\`found best \${Math.round(1e4 * k.d) / 1e4} after \${O} probes\`));
  }
  let L = c / 2;
  for (let A = n; A < o; A += c)
    for (let m = i; m < l; m += c)
      v(A + L, m + L, L);
  for (; M.length; ) {
    const { max: A, x: m, y: F, h: k } = M.pop();
    if (A - d.d <= e) break;
    L = k / 2, v(m - L, F - L, L), v(m + L, F - L, L), v(m - L, F + L, L), v(m + L, F + L, L);
  }
  r && console.log(\`num probes: \${O}
best distance: \${d.d}\`);
  const _ = [d.x, d.y];
  return _.distance = d.d, _;
}
function Ue(t, e, r, n) {
  this.x = t, this.y = e, this.h = r, this.d = br(t, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function br(t, e, r) {
  let n = !1, i = 1 / 0;
  for (const o of r)
    for (let l = 0, a = o.length, h = a - 1; l < a; h = l++) {
      const c = o[l], M = o[h];
      c[1] > e != M[1] > e && t < (M[0] - c[0]) * (e - c[1]) / (M[1] - c[1]) + c[0] && (n = !n), i = Math.min(i, Sr(t, e, c, M));
    }
  return i === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(i);
}
function Er(t) {
  let e = 0, r = 0, n = 0;
  const i = t[0];
  for (let l = 0, a = i.length, h = a - 1; l < a; h = l++) {
    const c = i[l], M = i[h], d = c[0] * M[1] - M[0] * c[1];
    r += (c[0] + M[0]) * d, n += (c[1] + M[1]) * d, e += d * 3;
  }
  const o = new Ue(r / e, n / e, 0, t);
  return e === 0 || o.d < 0 ? new Ue(i[0][0], i[0][1], 0, t) : o;
}
function Sr(t, e, r, n) {
  let i = r[0], o = r[1], l = n[0] - i, a = n[1] - o;
  if (l !== 0 || a !== 0) {
    const h = ((t - i) * l + (e - o) * a) / (l * l + a * a);
    h > 1 ? (i = n[0], o = n[1]) : h > 0 && (i += l * h, o += a * h);
  }
  return l = t - i, a = e - o, l * l + a * a;
}
function Pr(t) {
  const e = [];
  return t.type === "FeatureCollection" ? at(t, function(r) {
    Oe(r, function(n) {
      e.push(Ae(n, r.properties));
    });
  }) : t.type === "Feature" ? Oe(t, function(r) {
    e.push(Ae(r, t.properties));
  }) : Oe(t, function(r) {
    e.push(Ae(r));
  }), ve(e);
}
function Mr(t, e = {}) {
  if (t.bbox != null && e.recompute !== !0)
    return t.bbox;
  const r = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return Oe(t, (n) => {
    r[0] > n[0] && (r[0] = n[0]), r[1] > n[1] && (r[1] = n[1]), r[2] < n[0] && (r[2] = n[0]), r[3] < n[1] && (r[3] = n[1]);
  }), r;
}
function Lr(t, e = {}) {
  const r = Mr(t), n = (r[0] + r[2]) / 2, i = (r[1] + r[3]) / 2;
  return Ae([n, i], e.properties, e);
}
function Dt(t) {
  if (!t)
    throw new Error("geojson is required");
  switch (t.type) {
    case "Feature":
      return Ht(t);
    case "FeatureCollection":
      return Ar(t);
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
function Ht(t) {
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
  }), e.properties = Ut(t.properties), t.geometry == null ? e.geometry = null : e.geometry = ct(t.geometry), e;
}
function Ut(t) {
  const e = {};
  return t && Object.keys(t).forEach((r) => {
    const n = t[r];
    typeof n == "object" ? n === null ? e[r] = null : Array.isArray(n) ? e[r] = n.map((i) => i) : e[r] = Ut(n) : e[r] = n;
  }), e;
}
function Ar(t) {
  const e = { type: "FeatureCollection" };
  return Object.keys(t).forEach((r) => {
    switch (r) {
      case "type":
      case "features":
        return;
      default:
        e[r] = t[r];
    }
  }), e.features = t.features.map((r) => Ht(r)), e;
}
function ct(t) {
  const e = { type: t.type };
  return t.bbox && (e.bbox = t.bbox), t.type === "GeometryCollection" ? (e.geometries = t.geometries.map((r) => ct(r)), e) : (e.coordinates = zt(t.coordinates), e);
}
function zt(t) {
  const e = t;
  return typeof e[0] != "object" ? e.slice() : e.map((r) => zt(r));
}
function ze(t) {
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
function _e(t) {
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
function _r(t, e) {
  return t.type === "FeatureCollection" ? "FeatureCollection" : t.type === "GeometryCollection" ? "GeometryCollection" : t.type === "Feature" && t.geometry !== null ? t.geometry.type : t.type;
}
function Nr(t, e, r = {}) {
  var n = ze(t), i = ze(e), o = ke(i[1] - n[1]), l = ke(i[0] - n[0]), a = ke(n[1]), h = ke(i[1]), c = Math.pow(Math.sin(o / 2), 2) + Math.pow(Math.sin(l / 2), 2) * Math.cos(a) * Math.cos(h);
  return gr(
    2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c)),
    r.units
  );
}
var Tr = Object.defineProperty, Cr = Object.defineProperties, Rr = Object.getOwnPropertyDescriptors, vt = Object.getOwnPropertySymbols, kr = Object.prototype.hasOwnProperty, Fr = Object.prototype.propertyIsEnumerable, bt = (t, e, r) => e in t ? Tr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, Et = (t, e) => {
  for (var r in e || (e = {}))
    kr.call(e, r) && bt(t, r, e[r]);
  if (vt)
    for (var r of vt(e))
      Fr.call(e, r) && bt(t, r, e[r]);
  return t;
}, St = (t, e) => Cr(t, Rr(e));
function Br(t, e, r = {}) {
  if (!t) throw new Error("targetPoint is required");
  if (!e) throw new Error("points is required");
  let n = 1 / 0, i = 0;
  at(e, (l, a) => {
    const h = Nr(t, l, r);
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
const he = 11102230246251565e-32, J = 134217729, Ir = (3 + 8 * he) * he;
function Qe(t, e, r, n, i) {
  let o, l, a, h, c = e[0], M = n[0], d = 0, E = 0;
  M > c == M > -c ? (o = c, c = e[++d]) : (o = M, M = n[++E]);
  let O = 0;
  if (d < t && E < r)
    for (M > c == M > -c ? (l = c + o, a = o - (l - c), c = e[++d]) : (l = M + o, a = o - (l - M), M = n[++E]), o = l, a !== 0 && (i[O++] = a); d < t && E < r; )
      M > c == M > -c ? (l = o + c, h = l - o, a = o - (l - h) + (c - h), c = e[++d]) : (l = o + M, h = l - o, a = o - (l - h) + (M - h), M = n[++E]), o = l, a !== 0 && (i[O++] = a);
  for (; d < t; )
    l = o + c, h = l - o, a = o - (l - h) + (c - h), c = e[++d], o = l, a !== 0 && (i[O++] = a);
  for (; E < r; )
    l = o + M, h = l - o, a = o - (l - h) + (M - h), M = n[++E], o = l, a !== 0 && (i[O++] = a);
  return (o !== 0 || O === 0) && (i[O++] = o), O;
}
function Gr(t, e) {
  let r = e[0];
  for (let n = 1; n < t; n++) r += e[n];
  return r;
}
function Ne(t) {
  return new Float64Array(t);
}
const qr = (3 + 16 * he) * he, Dr = (2 + 12 * he) * he, Hr = (9 + 64 * he) * he * he, me = Ne(4), Pt = Ne(8), Mt = Ne(12), Lt = Ne(16), Z = Ne(4);
function Ur(t, e, r, n, i, o, l) {
  let a, h, c, M, d, E, O, v, L, _, A, m, F, k, N, C, R, s;
  const u = t - i, f = r - i, x = e - o, p = n - o;
  k = u * p, E = J * u, O = E - (E - u), v = u - O, E = J * p, L = E - (E - p), _ = p - L, N = v * _ - (k - O * L - v * L - O * _), C = x * f, E = J * x, O = E - (E - x), v = x - O, E = J * f, L = E - (E - f), _ = f - L, R = v * _ - (C - O * L - v * L - O * _), A = N - R, d = N - A, me[0] = N - (A + d) + (d - R), m = k + A, d = m - k, F = k - (m - d) + (A - d), A = F - C, d = F - A, me[1] = F - (A + d) + (d - C), s = m + A, d = s - m, me[2] = m - (s - d) + (A - d), me[3] = s;
  let y = Gr(4, me), b = Dr * l;
  if (y >= b || -y >= b || (d = t - u, a = t - (u + d) + (d - i), d = r - f, c = r - (f + d) + (d - i), d = e - x, h = e - (x + d) + (d - o), d = n - p, M = n - (p + d) + (d - o), a === 0 && h === 0 && c === 0 && M === 0) || (b = Hr * l + Ir * Math.abs(y), y += u * M + p * a - (x * c + f * h), y >= b || -y >= b)) return y;
  k = a * p, E = J * a, O = E - (E - a), v = a - O, E = J * p, L = E - (E - p), _ = p - L, N = v * _ - (k - O * L - v * L - O * _), C = h * f, E = J * h, O = E - (E - h), v = h - O, E = J * f, L = E - (E - f), _ = f - L, R = v * _ - (C - O * L - v * L - O * _), A = N - R, d = N - A, Z[0] = N - (A + d) + (d - R), m = k + A, d = m - k, F = k - (m - d) + (A - d), A = F - C, d = F - A, Z[1] = F - (A + d) + (d - C), s = m + A, d = s - m, Z[2] = m - (s - d) + (A - d), Z[3] = s;
  const g = Qe(4, me, 4, Z, Pt);
  k = u * M, E = J * u, O = E - (E - u), v = u - O, E = J * M, L = E - (E - M), _ = M - L, N = v * _ - (k - O * L - v * L - O * _), C = x * c, E = J * x, O = E - (E - x), v = x - O, E = J * c, L = E - (E - c), _ = c - L, R = v * _ - (C - O * L - v * L - O * _), A = N - R, d = N - A, Z[0] = N - (A + d) + (d - R), m = k + A, d = m - k, F = k - (m - d) + (A - d), A = F - C, d = F - A, Z[1] = F - (A + d) + (d - C), s = m + A, d = s - m, Z[2] = m - (s - d) + (A - d), Z[3] = s;
  const w = Qe(g, Pt, 4, Z, Mt);
  k = a * M, E = J * a, O = E - (E - a), v = a - O, E = J * M, L = E - (E - M), _ = M - L, N = v * _ - (k - O * L - v * L - O * _), C = h * c, E = J * h, O = E - (E - h), v = h - O, E = J * c, L = E - (E - c), _ = c - L, R = v * _ - (C - O * L - v * L - O * _), A = N - R, d = N - A, Z[0] = N - (A + d) + (d - R), m = k + A, d = m - k, F = k - (m - d) + (A - d), A = F - C, d = F - A, Z[1] = F - (A + d) + (d - C), s = m + A, d = s - m, Z[2] = m - (s - d) + (A - d), Z[3] = s;
  const P = Qe(w, Mt, 4, Z, Lt);
  return Lt[P - 1];
}
function zr(t, e, r, n, i, o) {
  const l = (e - o) * (r - i), a = (t - i) * (n - o), h = l - a, c = Math.abs(l + a);
  return Math.abs(h) >= qr * c ? h : -Ur(t, e, r, n, i, o, c);
}
function Vr(t, e) {
  var r, n, i = 0, o, l, a, h, c, M, d, E = t[0], O = t[1], v = e.length;
  for (r = 0; r < v; r++) {
    n = 0;
    var L = e[r], _ = L.length - 1;
    if (M = L[0], M[0] !== L[_][0] && M[1] !== L[_][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (l = M[0] - E, a = M[1] - O, n; n < _; n++) {
      if (d = L[n + 1], h = d[0] - E, c = d[1] - O, a === 0 && c === 0) {
        if (h <= 0 && l >= 0 || l <= 0 && h >= 0)
          return 0;
      } else if (c >= 0 && a <= 0 || c <= 0 && a >= 0) {
        if (o = zr(l, h, a, c, 0, 0), o === 0)
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
  const n = ze(t), i = Or(e), o = i.type, l = e.bbox;
  let a = i.coordinates;
  if (l && Kr(n, l) === !1)
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
function Kr(t, e) {
  return e[0] <= t[0] && e[1] <= t[1] && e[2] >= t[0] && e[3] >= t[1];
}
function At(t) {
  const e = Xr(t), r = Lr(e);
  let n = !1, i = 0;
  for (; !n && i < e.features.length; ) {
    const o = e.features[i].geometry;
    let l, a, h, c, M, d, E = !1;
    if (o.type === "Point")
      r.geometry.coordinates[0] === o.coordinates[0] && r.geometry.coordinates[1] === o.coordinates[1] && (n = !0);
    else if (o.type === "MultiPoint") {
      let O = !1, v = 0;
      for (; !O && v < o.coordinates.length; )
        r.geometry.coordinates[0] === o.coordinates[v][0] && r.geometry.coordinates[1] === o.coordinates[v][1] && (n = !0, O = !0), v++;
    } else if (o.type === "LineString") {
      let O = 0;
      for (; !E && O < o.coordinates.length - 1; )
        l = r.geometry.coordinates[0], a = r.geometry.coordinates[1], h = o.coordinates[O][0], c = o.coordinates[O][1], M = o.coordinates[O + 1][0], d = o.coordinates[O + 1][1], Ot(l, a, h, c, M, d) && (E = !0, n = !0), O++;
    } else if (o.type === "MultiLineString") {
      let O = 0;
      for (; O < o.coordinates.length; ) {
        E = !1;
        let v = 0;
        const L = o.coordinates[O];
        for (; !E && v < L.length - 1; )
          l = r.geometry.coordinates[0], a = r.geometry.coordinates[1], h = L[v][0], c = L[v][1], M = L[v + 1][0], d = L[v + 1][1], Ot(l, a, h, c, M, d) && (E = !0, n = !0), v++;
        O++;
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
        Pr(e.features[l]).features
      );
    return Ae(Br(r, o).geometry.coordinates);
  }
}
function Xr(t) {
  return t.type !== "FeatureCollection" ? t.type !== "Feature" ? ve([ge(t)]) : ve([t]) : t;
}
function Ot(t, e, r, n, i, o) {
  const l = Math.sqrt((i - r) * (i - r) + (o - n) * (o - n)), a = Math.sqrt((t - r) * (t - r) + (e - n) * (e - n)), h = Math.sqrt((i - t) * (i - t) + (o - e) * (o - e));
  return l === a + h;
}
function _t(t, e, r = {}) {
  const n = ze(t), i = _e(e);
  for (let o = 0; o < i.length - 1; o++) {
    let l = !1;
    if (r.ignoreEndVertices && (o === 0 && (l = "start"), o === i.length - 2 && (l = "end"), o === 0 && o + 1 === i.length - 1 && (l = "both")), Yr(
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
function Yr(t, e, r, n, i) {
  const o = r[0], l = r[1], a = t[0], h = t[1], c = e[0], M = e[1], d = r[0] - a, E = r[1] - h, O = c - a, v = M - h, L = d * v - E * O;
  if (i !== null) {
    if (Math.abs(L) > i)
      return !1;
  } else if (L !== 0)
    return !1;
  if (Math.abs(O) === Math.abs(v) && Math.abs(O) === 0)
    return n ? !1 : r[0] === t[0] && r[1] === t[1];
  if (n) {
    if (n === "start")
      return Math.abs(O) >= Math.abs(v) ? O > 0 ? a < o && o <= c : c <= o && o < a : v > 0 ? h < l && l <= M : M <= l && l < h;
    if (n === "end")
      return Math.abs(O) >= Math.abs(v) ? O > 0 ? a <= o && o < c : c < o && o <= a : v > 0 ? h <= l && l < M : M < l && l <= h;
    if (n === "both")
      return Math.abs(O) >= Math.abs(v) ? O > 0 ? a < o && o < c : c < o && o < a : v > 0 ? h < l && l < M : M < l && l < h;
  } else return Math.abs(O) >= Math.abs(v) ? O > 0 ? a <= o && o <= c : c <= o && o <= a : v > 0 ? h <= l && l <= M : M <= l && l <= h;
  return !1;
}
function Jr(t, e = {}) {
  var r = typeof e == "object" ? e.mutate : e;
  if (!t) throw new Error("geojson is required");
  var n = _r(t), i = [];
  switch (n) {
    case "LineString":
      i = je(t, n);
      break;
    case "MultiLineString":
    case "Polygon":
      _e(t).forEach(function(l) {
        i.push(je(l, n));
      });
      break;
    case "MultiPolygon":
      _e(t).forEach(function(l) {
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
      _e(t).forEach(function(l) {
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
  const r = _e(t);
  if (r.length === 2 && !Nt(r[0], r[1])) return r;
  const n = [];
  let i = 0, o = 1, l = 2;
  for (n.push(r[i]); l < r.length; )
    _t(r[o], wt([r[i], r[l]])) ? o = l : (n.push(r[o]), i = o, o++, l = o), l++;
  if (n.push(r[o]), e === "Polygon" || e === "MultiPolygon") {
    if (_t(
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
function Wr(t, e) {
  var r = t[0] - e[0], n = t[1] - e[1];
  return r * r + n * n;
}
function Zr(t, e, r) {
  var n = e[0], i = e[1], o = r[0] - n, l = r[1] - i;
  if (o !== 0 || l !== 0) {
    var a = ((t[0] - n) * o + (t[1] - i) * l) / (o * o + l * l);
    a > 1 ? (n = r[0], i = r[1]) : a > 0 && (n += o * a, i += l * a);
  }
  return o = t[0] - n, l = t[1] - i, o * o + l * l;
}
function Qr(t, e) {
  for (var r = t[0], n = [r], i, o = 1, l = t.length; o < l; o++)
    i = t[o], Wr(i, r) > e && (n.push(i), r = i);
  return r !== i && n.push(i), n;
}
function lt(t, e, r, n, i) {
  for (var o = n, l, a = e + 1; a < r; a++) {
    var h = Zr(t[a], t[e], t[r]);
    h > o && (l = a, o = h);
  }
  o > n && (l - e > 1 && lt(t, e, l, n, i), i.push(t[l]), r - l > 1 && lt(t, l, r, n, i));
}
function jr(t, e) {
  var r = t.length - 1, n = [t[0]];
  return lt(t, 0, r, e, n), n.push(t[r]), n;
}
function Ve(t, e, r) {
  if (t.length <= 2) return t;
  var n = e !== void 0 ? e * e : 1;
  return t = r ? t : Qr(t, n), t = jr(t, n), t;
}
function Tt(t, e = {}) {
  var r, n, i;
  if (e = e ?? {}, !yr(e)) throw new Error("options is invalid");
  const o = (r = e.tolerance) != null ? r : 1, l = (n = e.highQuality) != null ? n : !1, a = (i = e.mutate) != null ? i : !1;
  if (!t) throw new Error("geojson is required");
  if (o && o < 0) throw new Error("invalid tolerance");
  return a !== !0 && (t = Dt(t)), ft(t, function(h) {
    en(h, o, l);
  }), t;
}
function en(t, e, r) {
  const n = t.type;
  if (n === "Point" || n === "MultiPoint") return t;
  if (Jr(t, { mutate: !0 }), n !== "GeometryCollection")
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
const ut = new TextEncoder(), Vt = new TextDecoder();
let ue = !1;
function Fe(t, e = {}) {
  const r = [], n = [], i = [], o = [], l = /* @__PURE__ */ new Map();
  let a = 0, h = 0;
  const c = (v) => {
    if (Array.isArray(v)) {
      const L = Number(v[0]), _ = Number(v[1]);
      n.push(Number.isFinite(L) ? L : 0, Number.isFinite(_) ? _ : 0);
    } else if (v && (typeof v.x == "number" || typeof v.y == "number")) {
      const L = Number(v.x), _ = Number(v.y);
      n.push(Number.isFinite(L) ? L : 0, Number.isFinite(_) ? _ : 0);
    } else
      n.push(0, 0);
  };
  for (const v of t) {
    const L = v.id == null ? "" : String(v.id), _ = v.geometry || {}, A = _.type || "Unknown", m = { id: L, type: A, coordsOffset: a, coordsLength: 0 };
    if (A === "Point") {
      const N = _.coordinates || [];
      c(N), m.coordsLength = 2;
    } else if (A === "LineString" || A === "MultiPoint") {
      const N = _.coordinates || [];
      for (const C of N) c(C);
      m.coordsLength = (N.length || 0) * 2;
    } else if (A === "Polygon") {
      const N = _.coordinates || [];
      m.ringLengths = [];
      for (const C of N) {
        m.ringLengths.push(C.length || 0);
        for (const R of C) c(R);
      }
      m.coordsLength = m.ringLengths.reduce((C, R) => C + R, 0) * 2;
    } else if (A === "MultiPolygon") {
      const N = _.coordinates || [];
      m.polygonRingCounts = [], m.ringLengths = [];
      for (const C of N) {
        m.polygonRingCounts.push(C.length || 0);
        for (const R of C) {
          m.ringLengths.push(R.length || 0);
          for (const s of R) c(s);
        }
      }
      m.coordsLength = m.ringLengths.reduce((C, R) => C + R, 0) * 2;
    } else
      m.coordsLength = 0;
    const F = v.properties || {}, k = [];
    for (const N of Object.keys(F)) {
      let C = l.get(N);
      C === void 0 && (C = o.length, o.push(N), l.set(N, C));
      const R = JSON.stringify(F[N]), s = ut.encode(R);
      i.push(s), k.push([C, h, s.length]), h += s.length;
    }
    m.props = k, a += m.coordsLength, r.push(m);
  }
  let M;
  if (e.propsBuffer)
    e.propsBuffer instanceof Uint8Array ? M = e.propsBuffer.subarray(0, h) : M = new Uint8Array(e.propsBuffer, 0, h), M.byteLength < h && (M = new Uint8Array(h));
  else if (e.pool) {
    const v = e.pool.rent(h || 1);
    M = new Uint8Array(v, 0, h);
  } else
    M = new Uint8Array(h);
  let d = 0;
  for (const v of i)
    M.set(v, d), d += v.length;
  const E = n.length;
  let O;
  if (e.coordsBuffer)
    e.coordsBuffer instanceof ArrayBuffer ? O = new Float32Array(e.coordsBuffer, 0, E) : e.coordsBuffer instanceof Float32Array ? O = e.coordsBuffer.subarray(0, E) : O = new Float32Array(E), O.length < E && (O = new Float32Array(E));
  else if (e.pool) {
    const v = e.pool.rent(E * 4 || 4);
    O = new Float32Array(v, 0, E);
  } else
    O = new Float32Array(E);
  return O.length > 0 && O.set(n), { meta: r, keys: o, propsBuffer: M, coordsArray: O };
}
function tn(t, e, r, n) {
  const i = r instanceof Float32Array ? r : new Float32Array(r), o = e instanceof Uint8Array ? e : e ? new Uint8Array(e) : new Uint8Array(0), l = [];
  for (let a = 0; a < (t.length || 0); a++) {
    const h = t[a] || {}, c = h.id, M = {};
    if (Array.isArray(h.props) && h.props.length && n && n.length)
      for (const _ of h.props) {
        const [A, m, F] = _;
        try {
          const k = o.subarray(m, m + F);
          M[n[A]] = JSON.parse(Vt.decode(k));
        } catch {
        }
      }
    const d = h.type || "Unknown";
    let E = h.coordsOffset || 0;
    const O = E + (h.coordsLength || 0);
    let v = null;
    if (d === "Point") {
      const _ = i[E], A = i[E + 1], m = Number.isFinite(_) ? Math.max(-180, Math.min(180, _)) : 0, F = Number.isFinite(A) ? Math.max(-90, Math.min(90, A)) : 0;
      if ((!Number.isFinite(_) || !Number.isFinite(A)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value", { index: a, id: c, rawX: _, rawY: A });
        } catch {
        }
      }
      v = { type: "Point", coordinates: [m, F] };
    } else if (d === "LineString" || d === "MultiPoint") {
      const _ = [];
      for (; E < O; E += 2) {
        const A = i[E], m = i[E + 1], F = Number.isFinite(A) ? Math.max(-180, Math.min(180, A)) : 0, k = Number.isFinite(m) ? Math.max(-90, Math.min(90, m)) : 0;
        if ((!Number.isFinite(A) || !Number.isFinite(m)) && !ue) {
          ue = !0;
          try {
            console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value", { index: a, id: c, rawX: A, rawY: m });
          } catch {
          }
        }
        _.push([F, k]);
      }
      v = { type: d, coordinates: _ };
    } else if (d === "Polygon") {
      const _ = [], A = h.ringLengths || [];
      for (const m of A) {
        const F = [];
        for (let k = 0; k < m; k++) {
          const N = i[E], C = i[E + 1], R = Number.isFinite(N) ? Math.max(-180, Math.min(180, N)) : 0, s = Number.isFinite(C) ? Math.max(-90, Math.min(90, C)) : 0;
          if ((!Number.isFinite(N) || !Number.isFinite(C)) && !ue) {
            ue = !0;
            try {
              console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value", { index: a, id: c, rawX: N, rawY: C });
            } catch {
            }
          }
          F.push([R, s]), E += 2;
        }
        _.push(F);
      }
      v = { type: "Polygon", coordinates: _ };
    } else if (d === "MultiPolygon") {
      const _ = [], A = h.polygonRingCounts || [], m = h.ringLengths || [];
      let F = 0;
      for (const k of A) {
        const N = [];
        for (let C = 0; C < k; C++) {
          const R = m[F++] || 0, s = [];
          for (let u = 0; u < R; u++) {
            const f = i[E], x = i[E + 1], p = Number.isFinite(f) ? Math.max(-180, Math.min(180, f)) : 0, y = Number.isFinite(x) ? Math.max(-90, Math.min(90, x)) : 0;
            if ((!Number.isFinite(f) || !Number.isFinite(x)) && !ue) {
              ue = !0;
              try {
                console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value", { index: a, id: c, rawX: f, rawY: x });
              } catch {
              }
            }
            s.push([p, y]), E += 2;
          }
          N.push(s);
        }
        _.push(N);
      }
      v = { type: "MultiPolygon", coordinates: _ };
    } else if (E < O) {
      const _ = i[E], A = i[E + 1], m = Number.isFinite(_) ? Math.max(-180, Math.min(180, _)) : 0, F = Number.isFinite(A) ? Math.max(-90, Math.min(90, A)) : 0;
      if ((!Number.isFinite(_) || !Number.isFinite(A)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value", { index: a, id: c, rawX: _, rawY: A });
        } catch {
        }
      }
      v = { type: "Point", coordinates: [m, F] };
    }
    v == null && (v = { type: "Point", coordinates: [0, 0] });
    const L = M && typeof M == "object" ? M : {};
    l.push({ type: "Feature", id: c, geometry: v, properties: L });
  }
  return l;
}
const Pe = new $e(), z = /* @__PURE__ */ new Map();
let et = 1e4, we = null;
const rn = (t, e) => {
  try {
    const r = t && t.geometry && t.geometry.coordinates;
    let n = vr(r, e);
    return (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1])) && (n = At(t).geometry.coordinates), {
      type: "Point",
      coordinates: [n[0], n[1]]
    };
  } catch {
    return console.log("Invalid feature geometry", t && t.id), At(t).geometry;
  }
}, nn = new ArrayBuffer(8), tt = new DataView(nn), sn = new ArrayBuffer(4), kt = new DataView(sn);
function $t() {
  return 2166136261;
}
function ie(t, e) {
  return t ^= e >>> 0, t = Math.imul(t, 16777619) >>> 0, t;
}
function on(t, e) {
  const r = Number(e) || 0;
  return tt.setFloat64(0, r, !0), t = ie(t, tt.getUint32(0, !0)), t = ie(t, tt.getUint32(4, !0)), t;
}
function oe(t, e) {
  const r = Number(e) || 0;
  return kt.setFloat32(0, r, !0), t = ie(t, kt.getUint32(0, !0)), t;
}
function Ge(t, e) {
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
  e = Ge(e, t.type || "");
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
function Kt(t, e, r = 1e-6) {
  if (typeof t == "number" && typeof e == "number") return Math.abs(t - e) <= r;
  if (Array.isArray(t) && Array.isArray(e)) {
    if (t.length !== e.length) return !1;
    for (let n = 0; n < t.length; n++)
      if (!Kt(t[n], e[n], r)) return !1;
    return !0;
  }
  return !1;
}
function ln(t, e) {
  return !t && !e ? !0 : !t || !e || t.type !== e.type ? !1 : Kt(t.coordinates, e.coordinates);
}
function un(t) {
  let e = $t();
  e = ie(e, t.length || 0);
  for (const r of t)
    if (e = Ge(e, r && r.id != null ? String(r.id) : ""), r && r.geometry && (e = ie(e, xe(r.geometry))), r && r.properties)
      for (const n of Object.keys(r.properties)) {
        e = Ge(e, n);
        const i = r.properties[n];
        i == null ? e = ie(e, 0) : typeof i == "number" ? e = on(e, i) : e = Ge(e, String(i));
      }
  return e;
}
onmessage = (t) => {
  let e = t && t.data;
  if (e && e.type === "diff_ack") {
    try {
      if (we) {
        for (const v of we.addList || []) {
          const L = v && (v.feature || v);
          if (L && L.id != null)
            try {
              const _ = v && v.geomHash !== void 0 ? v.geomHash : xe(L.geometry), A = v && v.rawHash !== void 0 ? v.rawHash : _;
              z.set(String(L.id), { feature: L, geomHash: _, rawHash: A, ts: Date.now() });
            } catch {
              z.set(String(L.id), { feature: L, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const v of we.updateList || []) {
          const L = v && (v.feature || v);
          if (L && L.id != null)
            try {
              const _ = v && v.geomHash !== void 0 ? v.geomHash : xe(L.geometry), A = v && v.rawHash !== void 0 ? v.rawHash : _;
              z.set(String(L.id), { feature: L, geomHash: _, rawHash: A, ts: Date.now() });
            } catch {
              z.set(String(L.id), { feature: L, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const v of we.removeList || [])
          try {
            z.delete(String(v));
          } catch {
          }
        for (; z.size > et; ) {
          const v = z.keys().next();
          if (v.done) break;
          z.delete(v.value);
        }
        we = null;
      }
    } catch {
    }
    return;
  }
  if (e && e.type === "request_full") {
    try {
      const v = Array.from(z.values()).map((F) => F.feature), { meta: L, keys: _, propsBuffer: A, coordsArray: m } = Fe(v || [], { pool: Pe });
      postMessage({ type: "geojson_bin", meta: L, keys: _, propsBuf: A.buffer, coords: m.buffer }, [A.buffer, m.buffer]);
    } catch {
    }
    return;
  }
  if (e && e.type === "features" && e.payload)
    try {
      const v = e.payload instanceof Uint8Array ? e.payload.buffer : e.payload, L = Vt.decode(v);
      e = JSON.parse(L);
    } catch {
      e = {};
    }
  if (e && e.type === "features_bin" && e.coords)
    try {
      const v = e.meta || [], L = e.propsBuf !== void 0 ? e.propsBuf : null, _ = e.coords, A = e.keys || [];
      e = { features: tn(v, L, _, A), tolerance: t.data && t.data.tolerance, promoteId: t.data && t.data.promoteId, _receivedPropsBuf: L, _receivedCoordsBuf: _, _receivedKeys: A, cacheSize: t.data && t.data.cacheSize };
    } catch {
      e = e || {};
    }
  const r = e || {}, n = r.features || [], i = r.tolerance || 1e-5, o = !0, l = /* @__PURE__ */ new Map();
  for (const v of n) {
    const L = v.id, _ = l.get(L) || [];
    _.push(v), l.set(L, _);
  }
  const a = { type: "FeatureCollection", features: [] }, h = [], c = [], M = /* @__PURE__ */ new Set(), d = [], E = /* @__PURE__ */ new Map();
  for (const [v, L] of l.entries()) {
    const _ = String(v), A = un(L), m = z.get(_);
    if (m && m.rawHash === A) {
      d.push(m.feature);
      continue;
    }
    const { clipped: F, ...k } = L[0] && L[0].properties || {};
    let N;
    if (L.length === 1) {
      const s = L[0].geometry;
      let u = { type: "Feature", id: v, geometry: s, properties: k };
      s.type === "MultiPolygon" ? N = Ze(u) : N = { type: "FeatureCollection", features: [u] }, N = Tt(N, { tolerance: i, mutate: o });
    } else
      N = { type: "FeatureCollection", features: L.map((s) => ({ type: "Feature", id: v, geometry: s.geometry, properties: k })) }, N.features.some((s) => s.geometry.type === "MultiPolygon") && (N = Ze(N)), N = Tt(N, { tolerance: i, mutate: o }), L.some((s) => s.properties && s.properties.clipped) && (N = mr(N)), N.geometry.type === "MultiPolygon" ? N = Ze(N) : N = { type: "FeatureCollection", features: [N] };
    N.features.forEach((s) => (s.id = v, s.geometry.type === "Polygon" ? s.geometry = rn(s, i) : console.log("Unexpected geometry type after union/simplify/flatten for id:" + v + " - type:" + s.geometry.type), s)), N = wr(N);
    const C = { type: "Feature", id: v, geometry: N.features[0].geometry, properties: k }, R = xe(C.geometry);
    if (!m)
      h.push(C);
    else if (R !== (m.geomHash || 0))
      try {
        ln(C.geometry, m.feature.geometry) || (c.push(C), M.add(_));
      } catch {
        c.push(C), M.add(_);
      }
    E.set(_, { feature: C, rawHash: A, geomHash: R }), d.push(C);
  }
  const O = r.promoteId;
  if (O)
    for (const v of d)
      v.properties || (v.properties = {}), v.id != null && (v.properties[O] === void 0 || v.properties[O] === null) && (v.properties[O] = v.id);
  try {
    e && typeof e.cacheSize == "number" && e.cacheSize > 0 && (et = e.cacheSize);
    const v = d && d.length ? d : a.features || [];
    if (z.size === 0) {
      for (const [u, f] of E.entries())
        try {
          z.set(u, { feature: f.feature, geomHash: f.geomHash, rawHash: f.rawHash, ts: Date.now() });
        } catch {
          z.set(u, { feature: f.feature, geomHash: f.geomHash || 0, rawHash: f.rawHash || 0, ts: Date.now() });
        }
      const { meta: N, keys: C, propsBuffer: R, coordsArray: s } = Fe(v || [], { pool: Pe });
      postMessage({ type: "geojson_bin", meta: N, keys: C, propsBuf: R.buffer, coords: s.buffer }, [R.buffer, s.buffer]);
      return;
    }
    const L = h.length;
    let _ = Math.max(0, z.size + L - et);
    const A = [];
    if (_ > 0) {
      for (const N of z.keys()) {
        if (A.length >= _) break;
        if (M.has(N)) continue;
        const C = z.get(N);
        A.push(C && C.feature && C.feature.id != null ? C.feature.id : N);
      }
      if (A.length < _)
        for (const N of z.keys()) {
          if (A.length >= _) break;
          if (A.includes(N)) continue;
          const C = z.get(N);
          A.push(C && C.feature && C.feature.id != null ? C.feature.id : N);
        }
    }
    if (h.length === 0 && c.length === 0 && A.length === 0)
      return;
    const m = c.map((N) => {
      const C = { id: N.id };
      N.geometry && (C.newGeometry = N.geometry);
      const R = z.get(String(N.id)), s = R && R.feature && R.feature.properties ? R.feature.properties : {}, u = N.properties || {}, f = Object.keys(s), x = Object.keys(u);
      if (x.length === 0 && f.length > 0)
        C.removeAllProperties = !0;
      else {
        const y = f.filter((b) => !(b in u));
        y.length && (C.removeProperties = y);
      }
      const p = x.filter((y) => u[y] !== s[y]).map((y) => ({ key: y, value: u[y] }));
      return p.length && (C.addOrUpdateProperties = p), C;
    }), F = h.map((N) => {
      const C = E.get(String(N.id));
      if (C) return { feature: C.feature, rawHash: C.rawHash, geomHash: C.geomHash };
      try {
        const R = xe(N.geometry);
        return { feature: N, rawHash: R, geomHash: R };
      } catch {
        return { feature: N, rawHash: 0, geomHash: 0 };
      }
    }), k = c.map((N) => {
      const C = E.get(String(N.id));
      if (C) return { feature: C.feature, rawHash: C.rawHash, geomHash: C.geomHash };
      try {
        const R = xe(N.geometry);
        return { feature: N, rawHash: R, geomHash: R };
      } catch {
        return { feature: N, rawHash: 0, geomHash: 0 };
      }
    });
    we = { addList: F, updateList: k, removeList: A };
    try {
      const N = { type: "geojson_diff_bin" };
      A.length && (z.size > 0 && A.length >= z.size ? N.removeAll = !0 : N.removeList = A);
      const C = [];
      if (h.length) {
        const { meta: R, keys: s, propsBuffer: u, coordsArray: f } = Fe(h || [], { pool: Pe });
        N.add = { meta: R, keys: s, propsBuf: u.buffer, coords: f.buffer }, u && u.buffer && C.push(u.buffer), f && f.buffer && C.push(f.buffer);
      }
      if (c.length) {
        const { meta: R, keys: s, propsBuffer: u, coordsArray: f } = Fe(c || [], { pool: Pe });
        N.update = { meta: R, keys: s, propsBuf: u.buffer, coords: f.buffer }, u && u.buffer && C.push(u.buffer), f && f.buffer && C.push(f.buffer);
      }
      if (m.length) {
        const R = [], s = /* @__PURE__ */ new Map(), u = [];
        let f = 0;
        const x = m.map((y) => {
          const b = { id: y.id };
          return y.removeAllProperties && (b.removeAllProperties = !0), Array.isArray(y.removeProperties) && y.removeProperties.length && (b.removeProperties = y.removeProperties.map((g) => {
            let w = s.get(g);
            return w === void 0 && (w = R.length, R.push(g), s.set(g, w)), w;
          })), Array.isArray(y.addOrUpdateProperties) && y.addOrUpdateProperties.length && (b.addOrUpdate = y.addOrUpdateProperties.map((g) => {
            const w = g.key;
            let P = s.get(w);
            P === void 0 && (P = R.length, R.push(w), s.set(w, P));
            const S = JSON.stringify(g.value), T = ut.encode(S);
            u.push(T);
            const B = f, I = T.length;
            return f += I, [P, B, I];
          })), b;
        });
        let p = null;
        if (f > 0) {
          const y = Pe.rent(f || 1);
          p = new Uint8Array(y, 0, f);
          let b = 0;
          for (const g of u)
            p.set(g, b), b += g.length;
        } else
          p = new Uint8Array(0);
        N.updateDiffsMeta = x, N.updateKeys = R, p && p.buffer && p.byteLength && (N.updatePropsBuf = p.buffer, C.push(p.buffer));
      }
      postMessage(N, C);
      return;
    } catch {
      try {
        const C = {};
        A.length && (z.size > 0 && A.length >= z.size ? C.removeAll = !0 : C.remove = A), h.length && (C.add = h), m.length && (C.update = m), postMessage({ type: "geojson_diff", diff: C });
        return;
      } catch {
      }
    }
    return;
  } catch {
    try {
      const L = JSON.stringify(a), _ = ut.encode(L);
      postMessage({ type: "geojson", payload: _.buffer }, [_.buffer]);
    } catch {
      postMessage(a);
    }
  }
};
`,Fn=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",Pn],{type:"text/javascript;charset=utf-8"});function ae(r){let n;try{if(n=Fn&&(self.URL||self.webkitURL).createObjectURL(Fn),!n)throw"";const e=new Worker(n,{type:"module",name:r?.name});return e.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(n)}),e}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(Pn),{type:"module",name:r?.name})}}class J{constructor(){this.map=new Map}static _nextPow2(n){return n<=0?0:(n=n-1>>>0,n|=n>>1,n|=n>>2,n|=n>>4,n|=n>>8,n|=n>>16,n+1>>>0)}rent(n){const e=J._nextPow2(n||1),s=this.map.get(e);return s&&s.length?s.pop():new ArrayBuffer(e)}release(n){if(!n||!n.byteLength)return;const e=J._nextPow2(n.byteLength);let s=this.map.get(e);s||(s=[],this.map.set(e,s)),s.push(n)}}const En=new TextEncoder,rn=new TextDecoder;let N=!1;function ue(r,n={}){const e=[],s=[],i=[],l=[],u=new Map;let d=0,c=0;const g=p=>{if(Array.isArray(p)){const P=Number(p[0]),m=Number(p[1]);s.push(Number.isFinite(P)?P:0,Number.isFinite(m)?m:0)}else if(p&&(typeof p.x=="number"||typeof p.y=="number")){const P=Number(p.x),m=Number(p.y);s.push(Number.isFinite(P)?P:0,Number.isFinite(m)?m:0)}else s.push(0,0)};for(const p of r){const P=p.id==null?"":String(p.id),m=p.geometry||{},S=m.type||"Unknown",w={id:P,type:S,coordsOffset:d,coordsLength:0};if(S==="Point"){const F=m.coordinates||[];g(F),w.coordsLength=2}else if(S==="LineString"||S==="MultiPoint"){const F=m.coordinates||[];for(const E of F)g(E);w.coordsLength=(F.length||0)*2}else if(S==="Polygon"){const F=m.coordinates||[];w.ringLengths=[];for(const E of F){w.ringLengths.push(E.length||0);for(const L of E)g(L)}w.coordsLength=w.ringLengths.reduce((E,L)=>E+L,0)*2}else if(S==="MultiPolygon"){const F=m.coordinates||[];w.polygonRingCounts=[],w.ringLengths=[];for(const E of F){w.polygonRingCounts.push(E.length||0);for(const L of E){w.ringLengths.push(L.length||0);for(const T of L)g(T)}}w.coordsLength=w.ringLengths.reduce((E,L)=>E+L,0)*2}else w.coordsLength=0;const A=p.properties||{},M=[];for(const F of Object.keys(A)){let E=u.get(F);E===void 0&&(E=l.length,l.push(F),u.set(F,E));const L=JSON.stringify(A[F]),T=En.encode(L);i.push(T),M.push([E,c,T.length]),c+=T.length}w.props=M,d+=w.coordsLength,e.push(w)}let y;if(n.propsBuffer)n.propsBuffer instanceof Uint8Array?y=n.propsBuffer.subarray(0,c):y=new Uint8Array(n.propsBuffer,0,c),y.byteLength<c&&(y=new Uint8Array(c));else if(n.pool){const p=n.pool.rent(c||1);y=new Uint8Array(p,0,c)}else y=new Uint8Array(c);let x=0;for(const p of i)y.set(p,x),x+=p.length;const a=s.length;let f;if(n.coordsBuffer)n.coordsBuffer instanceof ArrayBuffer?f=new Float32Array(n.coordsBuffer,0,a):n.coordsBuffer instanceof Float32Array?f=n.coordsBuffer.subarray(0,a):f=new Float32Array(a),f.length<a&&(f=new Float32Array(a));else if(n.pool){const p=n.pool.rent(a*4||4);f=new Float32Array(p,0,a)}else f=new Float32Array(a);return f.length>0&&f.set(s),{meta:e,keys:l,propsBuffer:y,coordsArray:f}}function sn(r,n,e,s){const i=e instanceof Float32Array?e:new Float32Array(e),l=n instanceof Uint8Array?n:n?new Uint8Array(n):new Uint8Array(0),u=[];for(let d=0;d<(r.length||0);d++){const c=r[d]||{},g=c.id,y={};if(Array.isArray(c.props)&&c.props.length&&s&&s.length)for(const m of c.props){const[S,w,A]=m;try{const M=l.subarray(w,w+A);y[s[S]]=JSON.parse(rn.decode(M))}catch{}}const x=c.type||"Unknown";let a=c.coordsOffset||0;const f=a+(c.coordsLength||0);let p=null;if(x==="Point"){const m=i[a],S=i[a+1],w=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,A=Number.isFinite(S)?Math.max(-90,Math.min(90,S)):0;if((!Number.isFinite(m)||!Number.isFinite(S))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value",{index:d,id:g,rawX:m,rawY:S})}catch{}}p={type:"Point",coordinates:[w,A]}}else if(x==="LineString"||x==="MultiPoint"){const m=[];for(;a<f;a+=2){const S=i[a],w=i[a+1],A=Number.isFinite(S)?Math.max(-180,Math.min(180,S)):0,M=Number.isFinite(w)?Math.max(-90,Math.min(90,w)):0;if((!Number.isFinite(S)||!Number.isFinite(w))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value",{index:d,id:g,rawX:S,rawY:w})}catch{}}m.push([A,M])}p={type:x,coordinates:m}}else if(x==="Polygon"){const m=[],S=c.ringLengths||[];for(const w of S){const A=[];for(let M=0;M<w;M++){const F=i[a],E=i[a+1],L=Number.isFinite(F)?Math.max(-180,Math.min(180,F)):0,T=Number.isFinite(E)?Math.max(-90,Math.min(90,E)):0;if((!Number.isFinite(F)||!Number.isFinite(E))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value",{index:d,id:g,rawX:F,rawY:E})}catch{}}A.push([L,T]),a+=2}m.push(A)}p={type:"Polygon",coordinates:m}}else if(x==="MultiPolygon"){const m=[],S=c.polygonRingCounts||[],w=c.ringLengths||[];let A=0;for(const M of S){const F=[];for(let E=0;E<M;E++){const L=w[A++]||0,T=[];for(let O=0;O<L;O++){const G=i[a],U=i[a+1],t=Number.isFinite(G)?Math.max(-180,Math.min(180,G)):0,o=Number.isFinite(U)?Math.max(-90,Math.min(90,U)):0;if((!Number.isFinite(G)||!Number.isFinite(U))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value",{index:d,id:g,rawX:G,rawY:U})}catch{}}T.push([t,o]),a+=2}F.push(T)}m.push(F)}p={type:"MultiPolygon",coordinates:m}}else if(a<f){const m=i[a],S=i[a+1],w=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,A=Number.isFinite(S)?Math.max(-90,Math.min(90,S)):0;if((!Number.isFinite(m)||!Number.isFinite(S))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value",{index:d,id:g,rawX:m,rawY:S})}catch{}}p={type:"Point",coordinates:[w,A]}}p==null&&(p={type:"Point",coordinates:[0,0]});const P=y&&typeof y=="object"?y:{};u.push({type:"Feature",id:g,geometry:p,properties:P})}return u}class Mn{constructor(n){return this.map=n.map,this.source=n.source instanceof maplibregl.VectorTileSource?n.source:this.map.getSource(n.source),this.sourceLayer=n.sourceLayer,this.fid=n.fid||"id",this.tiles=this.source.tiles.map(e=>e.split("{z}")[0]),this.tileSize=this.source.tileSize||512,this.tolerance=n.tolerance||1e-5,this.cacheSize=n.cacheSize||1e4,this.minion=new ae,this._abPool=new J,this.minion.onmessage=e=>{const s=e&&e.data;if(s)if(s.type==="geojson_bin"&&s.coords)try{const i=s.coords instanceof Uint8Array?s.coords.buffer:s.coords,l=s.propsBuf!==void 0?s.propsBuf:null,u=sn(s.meta||[],l,i,s.keys||[]);this.gjsource.setData({type:"FeatureCollection",features:u});try{l&&this._abPool.release(l instanceof ArrayBuffer?l:l.buffer)}catch{}try{i&&this._abPool.release(i instanceof ArrayBuffer?i:i.buffer)}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch(i){console.warn("Failed to decode binary worker response",i)}else if(s.type==="geojson_diff")try{const i=s&&s.diff?s.diff:{};if(this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(i);try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process geojson diff from worker",i)}else if(s.type==="geojson_diff_bin")try{const i=s.removeList||[],l=!!s.removeAll;let u=[];if(s.add&&s.add.coords)try{const a=s.add.propsBuf!==void 0?s.add.propsBuf:null,f=s.add.coords;u=sn(s.add.meta||[],a,f,s.add.keys||[]);try{a&&this._abPool.release(a instanceof ArrayBuffer?a:a.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(a){console.warn("Failed to decode add-list from worker",a);try{this.minion.postMessage({type:"request_full"})}catch{}return}let d=[];if(s.update&&s.update.coords)try{const a=s.update.propsBuf!==void 0?s.update.propsBuf:null,f=s.update.coords;d=sn(s.update.meta||[],a,f,s.update.keys||[]);try{a&&this._abPool.release(a instanceof ArrayBuffer?a:a.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(a){console.warn("Failed to decode update-list from worker",a);try{this.minion.postMessage({type:"request_full"})}catch{}return}let c=[];if(s.updateDiffs&&Array.isArray(s.updateDiffs))c=s.updateDiffs;else if(s.updateDiffsMeta&&Array.isArray(s.updateDiffsMeta))try{const a=s.updateKeys||[],f=s.updatePropsBuf!==void 0?s.updatePropsBuf:null,p=f?f instanceof Uint8Array?f:new Uint8Array(f):new Uint8Array(0),P=rn;for(const m of s.updateDiffsMeta){const S={id:m.id};if(m.removeAllProperties&&(S.removeAllProperties=!0),Array.isArray(m.removeProperties)&&m.removeProperties.length&&(S.removeProperties=m.removeProperties.map(w=>a[w])),Array.isArray(m.addOrUpdate)&&m.addOrUpdate.length){const w=[];for(const A of m.addOrUpdate){const[M,F,E]=A,L=a[M];try{const T=p.subarray(F,F+E),O=JSON.parse(P.decode(T));w.push({key:L,value:O})}catch{}}w.length&&(S.addOrUpdateProperties=w)}c.push(S)}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(a){console.warn("Failed to decode compacted update diffs",a)}const g=new Map((d||[]).map(a=>[String(a.id),a])),y=c.map(a=>{const f={id:a.id},p=g.get(String(a.id));return p&&p.geometry&&(f.newGeometry=p.geometry),a.removeAllProperties&&(f.removeAllProperties=!0),a.removeProperties&&(f.removeProperties=a.removeProperties),a.addOrUpdateProperties&&(f.addOrUpdateProperties=a.addOrUpdateProperties),f}).filter(a=>a!=null),x={};if(l?x.removeAll=!0:i.length&&(x.remove=i),u.length&&(x.add=u),y.length&&(x.update=y),this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(x);try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process binary geojson diff from worker",i)}else if(s.type==="geojson"&&s.payload)try{const i=s.payload instanceof Uint8Array?s.payload.buffer:s.payload,l=rn.decode(i),u=JSON.parse(l);this.gjsource.setData(u)}catch(i){console.warn("Failed to decode worker response",i)}else try{this.gjsource.setData(s)}catch(i){console.warn("Failed to set worker data",i)}},this.map.addSource(this.source.id+"-proper",{type:"geojson",maxzoom:this.source.maxzoom,promoteId:this.fid,data:{}}),this.gjsource=this.map.getSource(this.source.id+"-proper"),maplibregl.addProtocol("proper",this._protocol),this.map.setTransformRequest((e,s)=>this.tiles.some(l=>e.startsWith(l))&&s==="Tile"?{url:"proper://"+e}:{url:e}),this._pendingPost=null,this._postTimer=null,this._postDelay=n.postDelay||100,this.map.on("sourcedata",e=>{if(e.sourceId===this.source.id&&e.isSourceLoaded){const s=this.map.querySourceFeatures(this.source.id,{sourceLayer:this.sourceLayer}),i=e.tile.tileID.canonical.z,l=this.tolerance*Math.pow(10,-.301*i+5.19),u={features:s.map(d=>({id:d.id,geometry:d.geometry,properties:d.properties})),tolerance:l};this._pendingPost=u,this._postTimer==null&&(this._postTimer=setTimeout(()=>{try{if(this._pendingPost)try{const{meta:d,keys:c,propsBuffer:g,coordsArray:y}=ue(this._pendingPost.features||[],{pool:this._abPool});this.minion.postMessage({type:"features_bin",meta:d,keys:c,propsBuf:g.buffer,tolerance:this._pendingPost.tolerance,coords:y.buffer,cacheSize:this.cacheSize,promoteId:this.fid},[g.buffer,y.buffer])}catch{try{const c=Object.assign({},this._pendingPost,{promoteId:this.fid}),g=JSON.stringify(c),y=En.encode(g);this.minion.postMessage({type:"features",payload:y.buffer},[y.buffer])}catch{const g=Object.assign({},this._pendingPost,{promoteId:this.fid});this.minion.postMessage(g)}}}finally{this._pendingPost=null,this._postTimer=null}},this._postDelay))}}),this.map.refreshTiles(this.source.id),this.gjsource}_protocol=async n=>{const s=n.url.replace("proper://",""),i=n.url.split(/\/|\./i);if(i===null||i.length<4)return console.warn(`Malformed URL: ${n.url}`),{data:null};const l=await fetch(s);let u;if(l.status===200){const d=i.length,[c,g,y]=i.slice(d-4,d-1).map(p=>p*1),x=await l.arrayBuffer(),a=new Yn(new An(x)),f={layers:Object.entries(a.layers).reduce((p,[P,m])=>({...p,[P]:{...m,feature:S=>{const w=m.feature(S),M=w.loadGeometry().flat(1/0).some(F=>F.x>=m.extent-1||F.y>=m.extent-1||F.x<=1||F.y<=1);return w.properties.clipped=M,w}}}),{})};u=Sn(f).buffer}else u=Sn({}).buffer;return{data:u}}}return maplibregl.VectorTileSource.prototype.ProperLabels=function(r){return this._proper||(this._proper=new Mn({map:this._map,source:this})),this._proper},Mn}));
