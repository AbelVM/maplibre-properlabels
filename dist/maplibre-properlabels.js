(function(H,I){typeof exports=="object"&&typeof module<"u"?module.exports=I():typeof define=="function"&&define.amd?define(I):(H=typeof globalThis<"u"?globalThis:H||self,H.ProperLabels=I())})(this,(function(){"use strict";const I=23283064365386963e-26,Fn=12,sn=typeof TextDecoder>"u"?null:new TextDecoder("utf-8"),X=0,$=1,q=2,K=5;class En{constructor(n=new Uint8Array(16)){this.buf=ArrayBuffer.isView(n)?n:new Uint8Array(n),this.dataView=new DataView(this.buf.buffer),this.pos=0,this.type=0,this.length=this.buf.length}readFields(n,e,s=this.length){for(;this.pos<s;){const r=this.readVarint(),l=r>>3,a=this.pos;this.type=r&7,n(l,e,this),this.pos===a&&this.skip(r)}return e}readMessage(n,e){return this.readFields(n,e,this.readVarint()+this.pos)}readFixed32(){const n=this.dataView.getUint32(this.pos,!0);return this.pos+=4,n}readSFixed32(){const n=this.dataView.getInt32(this.pos,!0);return this.pos+=4,n}readFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getUint32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readSFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getInt32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readFloat(){const n=this.dataView.getFloat32(this.pos,!0);return this.pos+=4,n}readDouble(){const n=this.dataView.getFloat64(this.pos,!0);return this.pos+=8,n}readVarint(n){const e=this.buf;let s,r;return r=e[this.pos++],s=r&127,r<128||(r=e[this.pos++],s|=(r&127)<<7,r<128)||(r=e[this.pos++],s|=(r&127)<<14,r<128)||(r=e[this.pos++],s|=(r&127)<<21,r<128)?s:(r=e[this.pos],s|=(r&15)<<28,Pn(s,n,this))}readVarint64(){return this.readVarint(!0)}readSVarint(){const n=this.readVarint();return n%2===1?(n+1)/-2:n/2}readBoolean(){return!!this.readVarint()}readString(){const n=this.readVarint()+this.pos,e=this.pos;return this.pos=n,n-e>=Fn&&sn?sn.decode(this.buf.subarray(e,n)):Cn(this.buf,e,n)}readBytes(){const n=this.readVarint()+this.pos,e=this.buf.subarray(this.pos,n);return this.pos=n,e}readPackedVarint(n=[],e){const s=this.readPackedEnd();for(;this.pos<s;)n.push(this.readVarint(e));return n}readPackedSVarint(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSVarint());return n}readPackedBoolean(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readBoolean());return n}readPackedFloat(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFloat());return n}readPackedDouble(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readDouble());return n}readPackedFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed32());return n}readPackedSFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed32());return n}readPackedFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed64());return n}readPackedSFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed64());return n}readPackedEnd(){return this.type===q?this.readVarint()+this.pos:this.pos+1}skip(n){const e=n&7;if(e===X)for(;this.buf[this.pos++]>127;);else if(e===q)this.pos=this.readVarint()+this.pos;else if(e===K)this.pos+=4;else if(e===$)this.pos+=8;else throw new Error(`Unimplemented type: ${e}`)}writeTag(n,e){this.writeVarint(n<<3|e)}realloc(n){let e=this.length||16;for(;e<this.pos+n;)e*=2;if(e!==this.length){const s=new Uint8Array(e);s.set(this.buf),this.buf=s,this.dataView=new DataView(s.buffer),this.length=e}}finish(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)}writeFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeSFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*I),!0),this.pos+=8}writeSFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*I),!0),this.pos+=8}writeVarint(n){if(n=+n||0,n>268435455||n<0){Mn(n,this);return}this.realloc(4),this.buf[this.pos++]=n&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=n>>>7&127)))}writeSVarint(n){this.writeVarint(n<0?-n*2-1:n*2)}writeBoolean(n){this.writeVarint(+n)}writeString(n){n=String(n),this.realloc(n.length*4),this.pos++;const e=this.pos;this.pos=Dn(this.buf,n,this.pos);const s=this.pos-e;s>=128&&on(e,s,this),this.pos=e-1,this.writeVarint(s),this.pos+=s}writeFloat(n){this.realloc(4),this.dataView.setFloat32(this.pos,n,!0),this.pos+=4}writeDouble(n){this.realloc(8),this.dataView.setFloat64(this.pos,n,!0),this.pos+=8}writeBytes(n){const e=n.length;this.writeVarint(e),this.realloc(e);for(let s=0;s<e;s++)this.buf[this.pos++]=n[s]}writeRawMessage(n,e){this.pos++;const s=this.pos;n(e,this);const r=this.pos-s;r>=128&&on(s,r,this),this.pos=s-1,this.writeVarint(r),this.pos+=r}writeMessage(n,e,s){this.writeTag(n,q),this.writeRawMessage(e,s)}writePackedVarint(n,e){e.length&&this.writeMessage(n,Tn,e)}writePackedSVarint(n,e){e.length&&this.writeMessage(n,Ln,e)}writePackedBoolean(n,e){e.length&&this.writeMessage(n,Vn,e)}writePackedFloat(n,e){e.length&&this.writeMessage(n,Nn,e)}writePackedDouble(n,e){e.length&&this.writeMessage(n,kn,e)}writePackedFixed32(n,e){e.length&&this.writeMessage(n,Bn,e)}writePackedSFixed32(n,e){e.length&&this.writeMessage(n,Rn,e)}writePackedFixed64(n,e){e.length&&this.writeMessage(n,On,e)}writePackedSFixed64(n,e){e.length&&this.writeMessage(n,In,e)}writeBytesField(n,e){this.writeTag(n,q),this.writeBytes(e)}writeFixed32Field(n,e){this.writeTag(n,K),this.writeFixed32(e)}writeSFixed32Field(n,e){this.writeTag(n,K),this.writeSFixed32(e)}writeFixed64Field(n,e){this.writeTag(n,$),this.writeFixed64(e)}writeSFixed64Field(n,e){this.writeTag(n,$),this.writeSFixed64(e)}writeVarintField(n,e){this.writeTag(n,X),this.writeVarint(e)}writeSVarintField(n,e){this.writeTag(n,X),this.writeSVarint(e)}writeStringField(n,e){this.writeTag(n,q),this.writeString(e)}writeFloatField(n,e){this.writeTag(n,K),this.writeFloat(e)}writeDoubleField(n,e){this.writeTag(n,$),this.writeDouble(e)}writeBooleanField(n,e){this.writeVarintField(n,+e)}}function Pn(i,n,e){const s=e.buf;let r,l;if(l=s[e.pos++],r=(l&112)>>4,l<128||(l=s[e.pos++],r|=(l&127)<<3,l<128)||(l=s[e.pos++],r|=(l&127)<<10,l<128)||(l=s[e.pos++],r|=(l&127)<<17,l<128)||(l=s[e.pos++],r|=(l&127)<<24,l<128)||(l=s[e.pos++],r|=(l&1)<<31,l<128))return C(i,r,n);throw new Error("Expected varint not more than 10 bytes")}function C(i,n,e){return e?n*4294967296+(i>>>0):(n>>>0)*4294967296+(i>>>0)}function Mn(i,n){let e,s;if(i>=0?(e=i%4294967296|0,s=i/4294967296|0):(e=~(-i%4294967296),s=~(-i/4294967296),e^4294967295?e=e+1|0:(e=0,s=s+1|0)),i>=18446744073709552e3||i<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");n.realloc(10),_n(e,s,n),An(s,n)}function _n(i,n,e){e.buf[e.pos++]=i&127|128,i>>>=7,e.buf[e.pos++]=i&127|128,i>>>=7,e.buf[e.pos++]=i&127|128,i>>>=7,e.buf[e.pos++]=i&127|128,i>>>=7,e.buf[e.pos]=i&127}function An(i,n){const e=(i&7)<<4;n.buf[n.pos++]|=e|((i>>>=3)?128:0),i&&(n.buf[n.pos++]=i&127|((i>>>=7)?128:0),i&&(n.buf[n.pos++]=i&127|((i>>>=7)?128:0),i&&(n.buf[n.pos++]=i&127|((i>>>=7)?128:0),i&&(n.buf[n.pos++]=i&127|((i>>>=7)?128:0),i&&(n.buf[n.pos++]=i&127)))))}function on(i,n,e){const s=n<=16383?1:n<=2097151?2:n<=268435455?3:Math.floor(Math.log(n)/(Math.LN2*7));e.realloc(s);for(let r=e.pos-1;r>=i;r--)e.buf[r+s]=e.buf[r]}function Tn(i,n){for(let e=0;e<i.length;e++)n.writeVarint(i[e])}function Ln(i,n){for(let e=0;e<i.length;e++)n.writeSVarint(i[e])}function Nn(i,n){for(let e=0;e<i.length;e++)n.writeFloat(i[e])}function kn(i,n){for(let e=0;e<i.length;e++)n.writeDouble(i[e])}function Vn(i,n){for(let e=0;e<i.length;e++)n.writeBoolean(i[e])}function Bn(i,n){for(let e=0;e<i.length;e++)n.writeFixed32(i[e])}function Rn(i,n){for(let e=0;e<i.length;e++)n.writeSFixed32(i[e])}function On(i,n){for(let e=0;e<i.length;e++)n.writeFixed64(i[e])}function In(i,n){for(let e=0;e<i.length;e++)n.writeSFixed64(i[e])}function Cn(i,n,e){let s="",r=n;for(;r<e;){const l=i[r];let a=null,p=l>239?4:l>223?3:l>191?2:1;if(r+p>e)break;let f,d,y;p===1?l<128&&(a=l):p===2?(f=i[r+1],(f&192)===128&&(a=(l&31)<<6|f&63,a<=127&&(a=null))):p===3?(f=i[r+1],d=i[r+2],(f&192)===128&&(d&192)===128&&(a=(l&15)<<12|(f&63)<<6|d&63,(a<=2047||a>=55296&&a<=57343)&&(a=null))):p===4&&(f=i[r+1],d=i[r+2],y=i[r+3],(f&192)===128&&(d&192)===128&&(y&192)===128&&(a=(l&15)<<18|(f&63)<<12|(d&63)<<6|y&63,(a<=65535||a>=1114112)&&(a=null))),a===null?(a=65533,p=1):a>65535&&(a-=65536,s+=String.fromCharCode(a>>>10&1023|55296),a=56320|a&1023),s+=String.fromCharCode(a),r+=p}return s}function Dn(i,n,e){for(let s=0,r,l;s<n.length;s++){if(r=n.charCodeAt(s),r>55295&&r<57344)if(l)if(r<56320){i[e++]=239,i[e++]=191,i[e++]=189,l=r;continue}else r=l-55296<<10|r-56320|65536,l=null;else{r>56319||s+1===n.length?(i[e++]=239,i[e++]=191,i[e++]=189):l=r;continue}else l&&(i[e++]=239,i[e++]=191,i[e++]=189,l=null);r<128?i[e++]=r:(r<2048?i[e++]=r>>6|192:(r<65536?i[e++]=r>>12|224:(i[e++]=r>>18|240,i[e++]=r>>12&63|128),i[e++]=r>>6&63|128),i[e++]=r&63|128)}return e}function R(i,n){this.x=i,this.y=n}R.prototype={clone(){return new R(this.x,this.y)},add(i){return this.clone()._add(i)},sub(i){return this.clone()._sub(i)},multByPoint(i){return this.clone()._multByPoint(i)},divByPoint(i){return this.clone()._divByPoint(i)},mult(i){return this.clone()._mult(i)},div(i){return this.clone()._div(i)},rotate(i){return this.clone()._rotate(i)},rotateAround(i,n){return this.clone()._rotateAround(i,n)},matMult(i){return this.clone()._matMult(i)},unit(){return this.clone()._unit()},perp(){return this.clone()._perp()},round(){return this.clone()._round()},mag(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals(i){return this.x===i.x&&this.y===i.y},dist(i){return Math.sqrt(this.distSqr(i))},distSqr(i){const n=i.x-this.x,e=i.y-this.y;return n*n+e*e},angle(){return Math.atan2(this.y,this.x)},angleTo(i){return Math.atan2(this.y-i.y,this.x-i.x)},angleWith(i){return this.angleWithSep(i.x,i.y)},angleWithSep(i,n){return Math.atan2(this.x*n-this.y*i,this.x*i+this.y*n)},_matMult(i){const n=i[0]*this.x+i[1]*this.y,e=i[2]*this.x+i[3]*this.y;return this.x=n,this.y=e,this},_add(i){return this.x+=i.x,this.y+=i.y,this},_sub(i){return this.x-=i.x,this.y-=i.y,this},_mult(i){return this.x*=i,this.y*=i,this},_div(i){return this.x/=i,this.y/=i,this},_multByPoint(i){return this.x*=i.x,this.y*=i.y,this},_divByPoint(i){return this.x/=i.x,this.y/=i.y,this},_unit(){return this._div(this.mag()),this},_perp(){const i=this.y;return this.y=this.x,this.x=-i,this},_rotate(i){const n=Math.cos(i),e=Math.sin(i),s=n*this.x-e*this.y,r=e*this.x+n*this.y;return this.x=s,this.y=r,this},_rotateAround(i,n){const e=Math.cos(i),s=Math.sin(i),r=n.x+e*(this.x-n.x)-s*(this.y-n.y),l=n.y+s*(this.x-n.x)+e*(this.y-n.y);return this.x=r,this.y=l,this},_round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},constructor:R},R.convert=function(i){if(i instanceof R)return i;if(Array.isArray(i))return new R(+i[0],+i[1]);if(i.x!==void 0&&i.y!==void 0)return new R(+i.x,+i.y);throw new Error("Expected [x, y] or {x, y} point format")};class an{constructor(n,e,s,r,l){this.properties={},this.extent=s,this.type=0,this.id=void 0,this._pbf=n,this._geometry=-1,this._keys=r,this._values=l,n.readFields(Gn,this,e)}loadGeometry(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos,s=[];let r,l=1,a=0,p=0,f=0;for(;n.pos<e;){if(a<=0){const d=n.readVarint();l=d&7,a=d>>3}if(a--,l===1||l===2)p+=n.readSVarint(),f+=n.readSVarint(),l===1&&(r&&s.push(r),r=[]),r&&r.push(new R(p,f));else if(l===7)r&&r.push(r[0].clone());else throw new Error(`unknown command ${l}`)}return r&&s.push(r),s}bbox(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos;let s=1,r=0,l=0,a=0,p=1/0,f=-1/0,d=1/0,y=-1/0;for(;n.pos<e;){if(r<=0){const x=n.readVarint();s=x&7,r=x>>3}if(r--,s===1||s===2)l+=n.readSVarint(),a+=n.readSVarint(),l<p&&(p=l),l>f&&(f=l),a<d&&(d=a),a>y&&(y=a);else if(s!==7)throw new Error(`unknown command ${s}`)}return[p,d,f,y]}toGeoJSON(n,e,s){const r=this.extent*Math.pow(2,s),l=this.extent*n,a=this.extent*e,p=this.loadGeometry();function f(u){return[(u.x+l)*360/r-180,360/Math.PI*Math.atan(Math.exp((1-(u.y+a)*2/r)*Math.PI))-90]}function d(u){return u.map(f)}let y;if(this.type===1){const u=[];for(const g of p)u.push(g[0]);const c=d(u);y=u.length===1?{type:"Point",coordinates:c[0]}:{type:"MultiPoint",coordinates:c}}else if(this.type===2){const u=p.map(d);y=u.length===1?{type:"LineString",coordinates:u[0]}:{type:"MultiLineString",coordinates:u}}else if(this.type===3){const u=qn(p),c=[];for(const g of u)c.push(g.map(d));y=c.length===1?{type:"Polygon",coordinates:c[0]}:{type:"MultiPolygon",coordinates:c}}else throw new Error("unknown feature type");const x={type:"Feature",geometry:y,properties:this.properties};return this.id!=null&&(x.id=this.id),x}}an.types=["Unknown","Point","LineString","Polygon"];function Gn(i,n,e){i===1?n.id=e.readVarint():i===2?Un(e,n):i===3?n.type=e.readVarint():i===4&&(n._geometry=e.pos)}function Un(i,n){const e=i.readVarint()+i.pos;for(;i.pos<e;){const s=n._keys[i.readVarint()],r=n._values[i.readVarint()];n.properties[s]=r}}function qn(i){const n=i.length;if(n<=1)return[i];const e=[];let s,r;for(let l=0;l<n;l++){const a=jn(i[l]);a!==0&&(r===void 0&&(r=a<0),r===a<0?(s&&e.push(s),s=[i[l]]):s&&s.push(i[l]))}return s&&e.push(s),e}function jn(i){let n=0;for(let e=0,s=i.length,r=s-1,l,a;e<s;r=e++)l=i[e],a=i[r],n+=(a.x-l.x)*(l.y+a.y);return n}class zn{constructor(n,e){this.version=1,this.name="",this.extent=4096,this.length=0,this._pbf=n,this._keys=[],this._values=[],this._features=[],n.readFields(Hn,this,e),this.length=this._features.length}feature(n){if(n<0||n>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[n];const e=this._pbf.readVarint()+this._pbf.pos;return new an(this._pbf,e,this.extent,this._keys,this._values)}}function Hn(i,n,e){i===15?n.version=e.readVarint():i===1?n.name=e.readString():i===5?n.extent=e.readVarint():i===2?n._features.push(e.pos):i===3?n._keys.push(e.readString()):i===4&&n._values.push($n(e))}function $n(i){let n=null;const e=i.readVarint()+i.pos;for(;i.pos<e;){const s=i.readVarint()>>3;n=s===1?i.readString():s===2?i.readFloat():s===3?i.readDouble():s===4?i.readVarint64():s===5?i.readVarint():s===6?i.readSVarint():s===7?i.readBoolean():null}if(n==null)throw new Error("unknown feature value");return n}class Kn{constructor(n,e){this.layers=n.readFields(Wn,{},e)}}function Wn(i,n,e){if(i===3){const s=new zn(e,e.readVarint()+e.pos);s.length&&(n[s.name]=s)}}function Jn(i){return i&&i.__esModule&&Object.prototype.hasOwnProperty.call(i,"default")?i.default:i}var D={exports:{}},W={};var ln;function Xn(){return ln||(ln=1,W.read=function(i,n,e,s,r){var l,a,p=r*8-s-1,f=(1<<p)-1,d=f>>1,y=-7,x=e?r-1:0,u=e?-1:1,c=i[n+x];for(x+=u,l=c&(1<<-y)-1,c>>=-y,y+=p;y>0;l=l*256+i[n+x],x+=u,y-=8);for(a=l&(1<<-y)-1,l>>=-y,y+=s;y>0;a=a*256+i[n+x],x+=u,y-=8);if(l===0)l=1-d;else{if(l===f)return a?NaN:(c?-1:1)*(1/0);a=a+Math.pow(2,s),l=l-d}return(c?-1:1)*a*Math.pow(2,l-s)},W.write=function(i,n,e,s,r,l){var a,p,f,d=l*8-r-1,y=(1<<d)-1,x=y>>1,u=r===23?Math.pow(2,-24)-Math.pow(2,-77):0,c=s?0:l-1,g=s?1:-1,w=n<0||n===0&&1/n<0?1:0;for(n=Math.abs(n),isNaN(n)||n===1/0?(p=isNaN(n)?1:0,a=y):(a=Math.floor(Math.log(n)/Math.LN2),n*(f=Math.pow(2,-a))<1&&(a--,f*=2),a+x>=1?n+=u/f:n+=u*Math.pow(2,1-x),n*f>=2&&(a++,f/=2),a+x>=y?(p=0,a=y):a+x>=1?(p=(n*f-1)*Math.pow(2,r),a=a+x):(p=n*Math.pow(2,x-1)*Math.pow(2,r),a=0));r>=8;i[e+c]=p&255,c+=g,p/=256,r-=8);for(a=a<<r|p,d+=r;d>0;i[e+c]=a&255,c+=g,a/=256,d-=8);i[e+c-g]|=w*128}),W}var Y,hn;function Yn(){if(hn)return Y;hn=1,Y=n;var i=Xn();function n(t){this.buf=ArrayBuffer.isView&&ArrayBuffer.isView(t)?t:new Uint8Array(t||0),this.pos=0,this.type=0,this.length=this.buf.length}n.Varint=0,n.Fixed64=1,n.Bytes=2,n.Fixed32=5;var e=65536*65536,s=1/e,r=12,l=typeof TextDecoder>"u"?null:new TextDecoder("utf-8");n.prototype={destroy:function(){this.buf=null},readFields:function(t,o,h){for(h=h||this.length;this.pos<h;){var v=this.readVarint(),S=v>>3,M=this.pos;this.type=v&7,t(S,o,this),this.pos===M&&this.skip(v)}return o},readMessage:function(t,o){return this.readFields(t,o,this.readVarint()+this.pos)},readFixed32:function(){var t=F(this.buf,this.pos);return this.pos+=4,t},readSFixed32:function(){var t=L(this.buf,this.pos);return this.pos+=4,t},readFixed64:function(){var t=F(this.buf,this.pos)+F(this.buf,this.pos+4)*e;return this.pos+=8,t},readSFixed64:function(){var t=F(this.buf,this.pos)+L(this.buf,this.pos+4)*e;return this.pos+=8,t},readFloat:function(){var t=i.read(this.buf,this.pos,!0,23,4);return this.pos+=4,t},readDouble:function(){var t=i.read(this.buf,this.pos,!0,52,8);return this.pos+=8,t},readVarint:function(t){var o=this.buf,h,v;return v=o[this.pos++],h=v&127,v<128||(v=o[this.pos++],h|=(v&127)<<7,v<128)||(v=o[this.pos++],h|=(v&127)<<14,v<128)||(v=o[this.pos++],h|=(v&127)<<21,v<128)?h:(v=o[this.pos],h|=(v&15)<<28,a(h,t,this))},readVarint64:function(){return this.readVarint(!0)},readSVarint:function(){var t=this.readVarint();return t%2===1?(t+1)/-2:t/2},readBoolean:function(){return!!this.readVarint()},readString:function(){var t=this.readVarint()+this.pos,o=this.pos;return this.pos=t,t-o>=r&&l?z(this.buf,o,t):k(this.buf,o,t)},readBytes:function(){var t=this.readVarint()+this.pos,o=this.buf.subarray(this.pos,t);return this.pos=t,o},readPackedVarint:function(t,o){if(this.type!==n.Bytes)return t.push(this.readVarint(o));var h=p(this);for(t=t||[];this.pos<h;)t.push(this.readVarint(o));return t},readPackedSVarint:function(t){if(this.type!==n.Bytes)return t.push(this.readSVarint());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readSVarint());return t},readPackedBoolean:function(t){if(this.type!==n.Bytes)return t.push(this.readBoolean());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readBoolean());return t},readPackedFloat:function(t){if(this.type!==n.Bytes)return t.push(this.readFloat());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readFloat());return t},readPackedDouble:function(t){if(this.type!==n.Bytes)return t.push(this.readDouble());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readDouble());return t},readPackedFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed32());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readFixed32());return t},readPackedSFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed32());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readSFixed32());return t},readPackedFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed64());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readFixed64());return t},readPackedSFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed64());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readSFixed64());return t},skip:function(t){var o=t&7;if(o===n.Varint)for(;this.buf[this.pos++]>127;);else if(o===n.Bytes)this.pos=this.readVarint()+this.pos;else if(o===n.Fixed32)this.pos+=4;else if(o===n.Fixed64)this.pos+=8;else throw new Error("Unimplemented type: "+o)},writeTag:function(t,o){this.writeVarint(t<<3|o)},realloc:function(t){for(var o=this.length||16;o<this.pos+t;)o*=2;if(o!==this.length){var h=new Uint8Array(o);h.set(this.buf),this.buf=h,this.length=o}},finish:function(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)},writeFixed32:function(t){this.realloc(4),E(this.buf,t,this.pos),this.pos+=4},writeSFixed32:function(t){this.realloc(4),E(this.buf,t,this.pos),this.pos+=4},writeFixed64:function(t){this.realloc(8),E(this.buf,t&-1,this.pos),E(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeSFixed64:function(t){this.realloc(8),E(this.buf,t&-1,this.pos),E(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeVarint:function(t){if(t=+t||0,t>268435455||t<0){d(t,this);return}this.realloc(4),this.buf[this.pos++]=t&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=t>>>7&127)))},writeSVarint:function(t){this.writeVarint(t<0?-t*2-1:t*2)},writeBoolean:function(t){this.writeVarint(!!t)},writeString:function(t){t=String(t),this.realloc(t.length*4),this.pos++;var o=this.pos;this.pos=G(this.buf,t,this.pos);var h=this.pos-o;h>=128&&u(o,h,this),this.pos=o-1,this.writeVarint(h),this.pos+=h},writeFloat:function(t){this.realloc(4),i.write(this.buf,t,this.pos,!0,23,4),this.pos+=4},writeDouble:function(t){this.realloc(8),i.write(this.buf,t,this.pos,!0,52,8),this.pos+=8},writeBytes:function(t){var o=t.length;this.writeVarint(o),this.realloc(o);for(var h=0;h<o;h++)this.buf[this.pos++]=t[h]},writeRawMessage:function(t,o){this.pos++;var h=this.pos;t(o,this);var v=this.pos-h;v>=128&&u(h,v,this),this.pos=h-1,this.writeVarint(v),this.pos+=v},writeMessage:function(t,o,h){this.writeTag(t,n.Bytes),this.writeRawMessage(o,h)},writePackedVarint:function(t,o){o.length&&this.writeMessage(t,c,o)},writePackedSVarint:function(t,o){o.length&&this.writeMessage(t,g,o)},writePackedBoolean:function(t,o){o.length&&this.writeMessage(t,m,o)},writePackedFloat:function(t,o){o.length&&this.writeMessage(t,w,o)},writePackedDouble:function(t,o){o.length&&this.writeMessage(t,A,o)},writePackedFixed32:function(t,o){o.length&&this.writeMessage(t,P,o)},writePackedSFixed32:function(t,o){o.length&&this.writeMessage(t,b,o)},writePackedFixed64:function(t,o){o.length&&this.writeMessage(t,_,o)},writePackedSFixed64:function(t,o){o.length&&this.writeMessage(t,T,o)},writeBytesField:function(t,o){this.writeTag(t,n.Bytes),this.writeBytes(o)},writeFixed32Field:function(t,o){this.writeTag(t,n.Fixed32),this.writeFixed32(o)},writeSFixed32Field:function(t,o){this.writeTag(t,n.Fixed32),this.writeSFixed32(o)},writeFixed64Field:function(t,o){this.writeTag(t,n.Fixed64),this.writeFixed64(o)},writeSFixed64Field:function(t,o){this.writeTag(t,n.Fixed64),this.writeSFixed64(o)},writeVarintField:function(t,o){this.writeTag(t,n.Varint),this.writeVarint(o)},writeSVarintField:function(t,o){this.writeTag(t,n.Varint),this.writeSVarint(o)},writeStringField:function(t,o){this.writeTag(t,n.Bytes),this.writeString(o)},writeFloatField:function(t,o){this.writeTag(t,n.Fixed32),this.writeFloat(o)},writeDoubleField:function(t,o){this.writeTag(t,n.Fixed64),this.writeDouble(o)},writeBooleanField:function(t,o){this.writeVarintField(t,!!o)}};function a(t,o,h){var v=h.buf,S,M;if(M=v[h.pos++],S=(M&112)>>4,M<128||(M=v[h.pos++],S|=(M&127)<<3,M<128)||(M=v[h.pos++],S|=(M&127)<<10,M<128)||(M=v[h.pos++],S|=(M&127)<<17,M<128)||(M=v[h.pos++],S|=(M&127)<<24,M<128)||(M=v[h.pos++],S|=(M&1)<<31,M<128))return f(t,S,o);throw new Error("Expected varint not more than 10 bytes")}function p(t){return t.type===n.Bytes?t.readVarint()+t.pos:t.pos+1}function f(t,o,h){return h?o*4294967296+(t>>>0):(o>>>0)*4294967296+(t>>>0)}function d(t,o){var h,v;if(t>=0?(h=t%4294967296|0,v=t/4294967296|0):(h=~(-t%4294967296),v=~(-t/4294967296),h^4294967295?h=h+1|0:(h=0,v=v+1|0)),t>=18446744073709552e3||t<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");o.realloc(10),y(h,v,o),x(v,o)}function y(t,o,h){h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos]=t&127}function x(t,o){var h=(t&7)<<4;o.buf[o.pos++]|=h|((t>>>=3)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127)))))}function u(t,o,h){var v=o<=16383?1:o<=2097151?2:o<=268435455?3:Math.floor(Math.log(o)/(Math.LN2*7));h.realloc(v);for(var S=h.pos-1;S>=t;S--)h.buf[S+v]=h.buf[S]}function c(t,o){for(var h=0;h<t.length;h++)o.writeVarint(t[h])}function g(t,o){for(var h=0;h<t.length;h++)o.writeSVarint(t[h])}function w(t,o){for(var h=0;h<t.length;h++)o.writeFloat(t[h])}function A(t,o){for(var h=0;h<t.length;h++)o.writeDouble(t[h])}function m(t,o){for(var h=0;h<t.length;h++)o.writeBoolean(t[h])}function P(t,o){for(var h=0;h<t.length;h++)o.writeFixed32(t[h])}function b(t,o){for(var h=0;h<t.length;h++)o.writeSFixed32(t[h])}function _(t,o){for(var h=0;h<t.length;h++)o.writeFixed64(t[h])}function T(t,o){for(var h=0;h<t.length;h++)o.writeSFixed64(t[h])}function F(t,o){return(t[o]|t[o+1]<<8|t[o+2]<<16)+t[o+3]*16777216}function E(t,o,h){t[h]=o,t[h+1]=o>>>8,t[h+2]=o>>>16,t[h+3]=o>>>24}function L(t,o){return(t[o]|t[o+1]<<8|t[o+2]<<16)+(t[o+3]<<24)}function k(t,o,h){for(var v="",S=o;S<h;){var M=t[S],N=null,O=M>239?4:M>223?3:M>191?2:1;if(S+O>h)break;var B,U,rn;O===1?M<128&&(N=M):O===2?(B=t[S+1],(B&192)===128&&(N=(M&31)<<6|B&63,N<=127&&(N=null))):O===3?(B=t[S+1],U=t[S+2],(B&192)===128&&(U&192)===128&&(N=(M&15)<<12|(B&63)<<6|U&63,(N<=2047||N>=55296&&N<=57343)&&(N=null))):O===4&&(B=t[S+1],U=t[S+2],rn=t[S+3],(B&192)===128&&(U&192)===128&&(rn&192)===128&&(N=(M&15)<<18|(B&63)<<12|(U&63)<<6|rn&63,(N<=65535||N>=1114112)&&(N=null))),N===null?(N=65533,O=1):N>65535&&(N-=65536,v+=String.fromCharCode(N>>>10&1023|55296),N=56320|N&1023),v+=String.fromCharCode(N),S+=O}return v}function z(t,o,h){return l.decode(t.subarray(o,h))}function G(t,o,h){for(var v=0,S,M;v<o.length;v++){if(S=o.charCodeAt(v),S>55295&&S<57344)if(M)if(S<56320){t[h++]=239,t[h++]=191,t[h++]=189,M=S;continue}else S=M-55296<<10|S-56320|65536,M=null;else{S>56319||v+1===o.length?(t[h++]=239,t[h++]=191,t[h++]=189):M=S;continue}else M&&(t[h++]=239,t[h++]=191,t[h++]=189,M=null);S<128?t[h++]=S:(S<2048?t[h++]=S>>6|192:(S<65536?t[h++]=S>>12|224:(t[h++]=S>>18|240,t[h++]=S>>12&63|128),t[h++]=S>>6&63|128),t[h++]=S&63|128)}return h}return Y}var Z,un;function cn(){if(un)return Z;un=1,Z=i;function i(n,e){this.x=n,this.y=e}return i.prototype={clone:function(){return new i(this.x,this.y)},add:function(n){return this.clone()._add(n)},sub:function(n){return this.clone()._sub(n)},multByPoint:function(n){return this.clone()._multByPoint(n)},divByPoint:function(n){return this.clone()._divByPoint(n)},mult:function(n){return this.clone()._mult(n)},div:function(n){return this.clone()._div(n)},rotate:function(n){return this.clone()._rotate(n)},rotateAround:function(n,e){return this.clone()._rotateAround(n,e)},matMult:function(n){return this.clone()._matMult(n)},unit:function(){return this.clone()._unit()},perp:function(){return this.clone()._perp()},round:function(){return this.clone()._round()},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals:function(n){return this.x===n.x&&this.y===n.y},dist:function(n){return Math.sqrt(this.distSqr(n))},distSqr:function(n){var e=n.x-this.x,s=n.y-this.y;return e*e+s*s},angle:function(){return Math.atan2(this.y,this.x)},angleTo:function(n){return Math.atan2(this.y-n.y,this.x-n.x)},angleWith:function(n){return this.angleWithSep(n.x,n.y)},angleWithSep:function(n,e){return Math.atan2(this.x*e-this.y*n,this.x*n+this.y*e)},_matMult:function(n){var e=n[0]*this.x+n[1]*this.y,s=n[2]*this.x+n[3]*this.y;return this.x=e,this.y=s,this},_add:function(n){return this.x+=n.x,this.y+=n.y,this},_sub:function(n){return this.x-=n.x,this.y-=n.y,this},_mult:function(n){return this.x*=n,this.y*=n,this},_div:function(n){return this.x/=n,this.y/=n,this},_multByPoint:function(n){return this.x*=n.x,this.y*=n.y,this},_divByPoint:function(n){return this.x/=n.x,this.y/=n.y,this},_unit:function(){return this._div(this.mag()),this},_perp:function(){var n=this.y;return this.y=this.x,this.x=-n,this},_rotate:function(n){var e=Math.cos(n),s=Math.sin(n),r=e*this.x-s*this.y,l=s*this.x+e*this.y;return this.x=r,this.y=l,this},_rotateAround:function(n,e){var s=Math.cos(n),r=Math.sin(n),l=e.x+s*(this.x-e.x)-r*(this.y-e.y),a=e.y+r*(this.x-e.x)+s*(this.y-e.y);return this.x=l,this.y=a,this},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},i.convert=function(n){return n instanceof i?n:Array.isArray(n)?new i(n[0],n[1]):n},Z}var j={},Q,fn;function pn(){if(fn)return Q;fn=1;var i=cn();Q=n;function n(a,p,f,d,y){this.properties={},this.extent=f,this.type=0,this._pbf=a,this._geometry=-1,this._keys=d,this._values=y,a.readFields(e,this,p)}function e(a,p,f){a==1?p.id=f.readVarint():a==2?s(f,p):a==3?p.type=f.readVarint():a==4&&(p._geometry=f.pos)}function s(a,p){for(var f=a.readVarint()+a.pos;a.pos<f;){var d=p._keys[a.readVarint()],y=p._values[a.readVarint()];p.properties[d]=y}}n.types=["Unknown","Point","LineString","Polygon"],n.prototype.loadGeometry=function(){var a=this._pbf;a.pos=this._geometry;for(var p=a.readVarint()+a.pos,f=1,d=0,y=0,x=0,u=[],c;a.pos<p;){if(d<=0){var g=a.readVarint();f=g&7,d=g>>3}if(d--,f===1||f===2)y+=a.readSVarint(),x+=a.readSVarint(),f===1&&(c&&u.push(c),c=[]),c.push(new i(y,x));else if(f===7)c&&c.push(c[0].clone());else throw new Error("unknown command "+f)}return c&&u.push(c),u},n.prototype.bbox=function(){var a=this._pbf;a.pos=this._geometry;for(var p=a.readVarint()+a.pos,f=1,d=0,y=0,x=0,u=1/0,c=-1/0,g=1/0,w=-1/0;a.pos<p;){if(d<=0){var A=a.readVarint();f=A&7,d=A>>3}if(d--,f===1||f===2)y+=a.readSVarint(),x+=a.readSVarint(),y<u&&(u=y),y>c&&(c=y),x<g&&(g=x),x>w&&(w=x);else if(f!==7)throw new Error("unknown command "+f)}return[u,g,c,w]},n.prototype.toGeoJSON=function(a,p,f){var d=this.extent*Math.pow(2,f),y=this.extent*a,x=this.extent*p,u=this.loadGeometry(),c=n.types[this.type],g,w;function A(b){for(var _=0;_<b.length;_++){var T=b[_],F=180-(T.y+x)*360/d;b[_]=[(T.x+y)*360/d-180,360/Math.PI*Math.atan(Math.exp(F*Math.PI/180))-90]}}switch(this.type){case 1:var m=[];for(g=0;g<u.length;g++)m[g]=u[g][0];u=m,A(u);break;case 2:for(g=0;g<u.length;g++)A(u[g]);break;case 3:for(u=r(u),g=0;g<u.length;g++)for(w=0;w<u[g].length;w++)A(u[g][w]);break}u.length===1?u=u[0]:c="Multi"+c;var P={type:"Feature",geometry:{type:c,coordinates:u},properties:this.properties};return"id"in this&&(P.id=this.id),P};function r(a){var p=a.length;if(p<=1)return[a];for(var f=[],d,y,x=0;x<p;x++){var u=l(a[x]);u!==0&&(y===void 0&&(y=u<0),y===u<0?(d&&f.push(d),d=[a[x]]):d.push(a[x]))}return d&&f.push(d),f}function l(a){for(var p=0,f=0,d=a.length,y=d-1,x,u;f<d;y=f++)x=a[f],u=a[y],p+=(u.x-x.x)*(x.y+u.y);return p}return Q}var nn,dn;function gn(){if(dn)return nn;dn=1;var i=pn();nn=n;function n(r,l){this.version=1,this.name=null,this.extent=4096,this.length=0,this._pbf=r,this._keys=[],this._values=[],this._features=[],r.readFields(e,this,l),this.length=this._features.length}function e(r,l,a){r===15?l.version=a.readVarint():r===1?l.name=a.readString():r===5?l.extent=a.readVarint():r===2?l._features.push(a.pos):r===3?l._keys.push(a.readString()):r===4&&l._values.push(s(a))}function s(r){for(var l=null,a=r.readVarint()+r.pos;r.pos<a;){var p=r.readVarint()>>3;l=p===1?r.readString():p===2?r.readFloat():p===3?r.readDouble():p===4?r.readVarint64():p===5?r.readVarint():p===6?r.readSVarint():p===7?r.readBoolean():null}return l}return n.prototype.feature=function(r){if(r<0||r>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[r];var l=this._pbf.readVarint()+this._pbf.pos;return new i(this._pbf,l,this.extent,this._keys,this._values)},nn}var en,yn;function Zn(){if(yn)return en;yn=1;var i=gn();en=n;function n(s,r){this.layers=s.readFields(e,{},r)}function e(s,r,l){if(s===3){var a=new i(l,l.readVarint()+l.pos);a.length&&(r[a.name]=a)}}return en}var xn;function Qn(){return xn||(xn=1,j.VectorTile=Zn(),j.VectorTileFeature=pn(),j.VectorTileLayer=gn()),j}var tn,wn;function ne(){if(wn)return tn;wn=1;var i=cn(),n=Qn().VectorTileFeature;tn=e;function e(r,l){this.options=l||{},this.features=r,this.length=r.length}e.prototype.feature=function(r){return new s(this.features[r],this.options.extent)};function s(r,l){this.id=typeof r.id=="number"?r.id:void 0,this.type=r.type,this.rawGeometry=r.type===1?[r.geometry]:r.geometry,this.properties=r.tags,this.extent=l||4096}return s.prototype.loadGeometry=function(){var r=this.rawGeometry;this.geometry=[];for(var l=0;l<r.length;l++){for(var a=r[l],p=[],f=0;f<a.length;f++)p.push(new i(a[f][0],a[f][1]));this.geometry.push(p)}return this.geometry},s.prototype.bbox=function(){this.geometry||this.loadGeometry();for(var r=this.geometry,l=1/0,a=-1/0,p=1/0,f=-1/0,d=0;d<r.length;d++)for(var y=r[d],x=0;x<y.length;x++){var u=y[x];l=Math.min(l,u.x),a=Math.max(a,u.x),p=Math.min(p,u.y),f=Math.max(f,u.y)}return[l,p,a,f]},s.prototype.toGeoJSON=n.prototype.toGeoJSON,tn}var mn;function ee(){if(mn)return D.exports;mn=1;var i=Yn(),n=ne();D.exports=e,D.exports.fromVectorTileJs=e,D.exports.fromGeojsonVt=s,D.exports.GeoJSONWrapper=n;function e(u){var c=new i;return r(u,c),c.finish()}function s(u,c){c=c||{};var g={};for(var w in u)g[w]=new n(u[w].features,c),g[w].name=w,g[w].version=c.version,g[w].extent=c.extent;return e({layers:g})}function r(u,c){for(var g in u.layers)c.writeMessage(3,l,u.layers[g])}function l(u,c){c.writeVarintField(15,u.version||1),c.writeStringField(1,u.name||""),c.writeVarintField(5,u.extent||4096);var g,w={keys:[],values:[],keycache:{},valuecache:{}};for(g=0;g<u.length;g++)w.feature=u.feature(g),c.writeMessage(2,a,w);var A=w.keys;for(g=0;g<A.length;g++)c.writeStringField(3,A[g]);var m=w.values;for(g=0;g<m.length;g++)c.writeMessage(4,x,m[g])}function a(u,c){var g=u.feature;g.id!==void 0&&c.writeVarintField(1,g.id),c.writeMessage(2,p,u),c.writeVarintField(3,g.type),c.writeMessage(4,y,g)}function p(u,c){var g=u.feature,w=u.keys,A=u.values,m=u.keycache,P=u.valuecache;for(var b in g.properties){var _=g.properties[b],T=m[b];if(_!==null){typeof T>"u"&&(w.push(b),T=w.length-1,m[b]=T),c.writeVarint(T);var F=typeof _;F!=="string"&&F!=="boolean"&&F!=="number"&&(_=JSON.stringify(_));var E=F+":"+_,L=P[E];typeof L>"u"&&(A.push(_),L=A.length-1,P[E]=L),c.writeVarint(L)}}}function f(u,c){return(c<<3)+(u&7)}function d(u){return u<<1^u>>31}function y(u,c){for(var g=u.loadGeometry(),w=u.type,A=0,m=0,P=g.length,b=0;b<P;b++){var _=g[b],T=1;w===1&&(T=_.length),c.writeVarint(f(1,T));for(var F=w===3?_.length-1:_.length,E=0;E<F;E++){E===1&&w!==1&&c.writeVarint(f(2,F-1));var L=_[E].x-A,k=_[E].y-m;c.writeVarint(d(L)),c.writeVarint(d(k)),A+=L,m+=k}w===3&&c.writeVarint(f(7,1))}}function x(u,c){var g=typeof u;g==="string"?c.writeStringField(1,u):g==="boolean"?c.writeBooleanField(7,u):g==="number"&&(u%1!==0?c.writeDoubleField(3,u):u<0?c.writeSVarintField(6,u):c.writeVarintField(5,u))}return D.exports}var te=ee();const ie=Jn(te),bn=`var vt = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Ie = Math.ceil, j = Math.floor, Z = "[BigNumber Error] ", Ke = Z + "Number primitive has more than 15 significant digits: ", te = 1e14, I = 14, ke = 9007199254740991, Be = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], fe = 1e7, Y = 1e9;
function ct(t) {
  var e, n, r, i = x.prototype = { constructor: x, toString: null, valueOf: null }, o = new x(1), u = 20, c = 4, m = -7, f = 21, v = -1e7, S = 1e7, L = !1, P = 1, N = 0, A = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, B = "0123456789abcdefghijklmnopqrstuvwxyz", O = !0;
  function x(s, l) {
    var a, d, p, y, E, h, g, b, w = this;
    if (!(w instanceof x)) return new x(s, l);
    if (l == null) {
      if (s && s._isBigNumber === !0) {
        w.s = s.s, !s.c || s.e > S ? w.c = w.e = null : s.e < v ? w.c = [w.e = 0] : (w.e = s.e, w.c = s.c.slice());
        return;
      }
      if ((h = typeof s == "number") && s * 0 == 0) {
        if (w.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (y = 0, E = s; E >= 10; E /= 10, y++) ;
          y > S ? w.c = w.e = null : (w.e = y, w.c = [s]);
          return;
        }
        b = String(s);
      } else {
        if (!vt.test(b = String(s))) return r(w, b, h);
        w.s = b.charCodeAt(0) == 45 ? (b = b.slice(1), -1) : 1;
      }
      (y = b.indexOf(".")) > -1 && (b = b.replace(".", "")), (E = b.search(/e/i)) > 0 ? (y < 0 && (y = E), y += +b.slice(E + 1), b = b.substring(0, E)) : y < 0 && (y = b.length);
    } else {
      if ($(l, 2, B.length, "Base"), l == 10 && O)
        return w = new x(s), C(w, u + w.e + 1, c);
      if (b = String(s), h = typeof s == "number") {
        if (s * 0 != 0) return r(w, b, h, l);
        if (w.s = 1 / s < 0 ? (b = b.slice(1), -1) : 1, x.DEBUG && b.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(Ke + s);
      } else
        w.s = b.charCodeAt(0) === 45 ? (b = b.slice(1), -1) : 1;
      for (a = B.slice(0, l), y = E = 0, g = b.length; E < g; E++)
        if (a.indexOf(d = b.charAt(E)) < 0) {
          if (d == ".") {
            if (E > y) {
              y = g;
              continue;
            }
          } else if (!p && (b == b.toUpperCase() && (b = b.toLowerCase()) || b == b.toLowerCase() && (b = b.toUpperCase()))) {
            p = !0, E = -1, y = 0;
            continue;
          }
          return r(w, String(s), h, l);
        }
      h = !1, b = n(b, l, 10, w.s), (y = b.indexOf(".")) > -1 ? b = b.replace(".", "") : y = b.length;
    }
    for (E = 0; b.charCodeAt(E) === 48; E++) ;
    for (g = b.length; b.charCodeAt(--g) === 48; ) ;
    if (b = b.slice(E, ++g)) {
      if (g -= E, h && x.DEBUG && g > 15 && (s > ke || s !== j(s)))
        throw Error(Ke + w.s * s);
      if ((y = y - E - 1) > S)
        w.c = w.e = null;
      else if (y < v)
        w.c = [w.e = 0];
      else {
        if (w.e = y, w.c = [], E = (y + 1) % I, y < 0 && (E += I), E < g) {
          for (E && w.c.push(+b.slice(0, E)), g -= I; E < g; )
            w.c.push(+b.slice(E, E += I));
          E = I - (b = b.slice(E)).length;
        } else
          E -= g;
        for (; E--; b += "0") ;
        w.c.push(+b);
      }
    } else
      w.c = [w.e = 0];
  }
  x.clone = ct, x.ROUND_UP = 0, x.ROUND_DOWN = 1, x.ROUND_CEIL = 2, x.ROUND_FLOOR = 3, x.ROUND_HALF_UP = 4, x.ROUND_HALF_DOWN = 5, x.ROUND_HALF_EVEN = 6, x.ROUND_HALF_CEIL = 7, x.ROUND_HALF_FLOOR = 8, x.EUCLID = 9, x.config = x.set = function(s) {
    var l, a;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(l = "DECIMAL_PLACES") && (a = s[l], $(a, 0, Y, l), u = a), s.hasOwnProperty(l = "ROUNDING_MODE") && (a = s[l], $(a, 0, 8, l), c = a), s.hasOwnProperty(l = "EXPONENTIAL_AT") && (a = s[l], a && a.pop ? ($(a[0], -Y, 0, l), $(a[1], 0, Y, l), m = a[0], f = a[1]) : ($(a, -Y, Y, l), m = -(f = a < 0 ? -a : a))), s.hasOwnProperty(l = "RANGE"))
          if (a = s[l], a && a.pop)
            $(a[0], -Y, -1, l), $(a[1], 1, Y, l), v = a[0], S = a[1];
          else if ($(a, -Y, Y, l), a)
            v = -(S = a < 0 ? -a : a);
          else
            throw Error(Z + l + " cannot be zero: " + a);
        if (s.hasOwnProperty(l = "CRYPTO"))
          if (a = s[l], a === !!a)
            if (a)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                L = a;
              else
                throw L = !a, Error(Z + "crypto unavailable");
            else
              L = a;
          else
            throw Error(Z + l + " not true or false: " + a);
        if (s.hasOwnProperty(l = "MODULO_MODE") && (a = s[l], $(a, 0, 9, l), P = a), s.hasOwnProperty(l = "POW_PRECISION") && (a = s[l], $(a, 0, Y, l), N = a), s.hasOwnProperty(l = "FORMAT"))
          if (a = s[l], typeof a == "object") A = a;
          else throw Error(Z + l + " not an object: " + a);
        if (s.hasOwnProperty(l = "ALPHABET"))
          if (a = s[l], typeof a == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(a))
            O = a.slice(0, 10) == "0123456789", B = a;
          else
            throw Error(Z + l + " invalid: " + a);
      } else
        throw Error(Z + "Object expected: " + s);
    return {
      DECIMAL_PLACES: u,
      ROUNDING_MODE: c,
      EXPONENTIAL_AT: [m, f],
      RANGE: [v, S],
      CRYPTO: L,
      MODULO_MODE: P,
      POW_PRECISION: N,
      FORMAT: A,
      ALPHABET: B
    };
  }, x.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!x.DEBUG) return !0;
    var l, a, d = s.c, p = s.e, y = s.s;
    e: if ({}.toString.call(d) == "[object Array]") {
      if ((y === 1 || y === -1) && p >= -Y && p <= Y && p === j(p)) {
        if (d[0] === 0) {
          if (p === 0 && d.length === 1) return !0;
          break e;
        }
        if (l = (p + 1) % I, l < 1 && (l += I), String(d[0]).length == l) {
          for (l = 0; l < d.length; l++)
            if (a = d[l], a < 0 || a >= te || a !== j(a)) break e;
          if (a !== 0) return !0;
        }
      }
    } else if (d === null && p === null && (y === null || y === 1 || y === -1))
      return !0;
    throw Error(Z + "Invalid BigNumber: " + s);
  }, x.maximum = x.max = function() {
    return k(arguments, -1);
  }, x.minimum = x.min = function() {
    return k(arguments, 1);
  }, x.random = (function() {
    var s = 9007199254740992, l = Math.random() * s & 2097151 ? function() {
      return j(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(a) {
      var d, p, y, E, h, g = 0, b = [], w = new x(o);
      if (a == null ? a = u : $(a, 0, Y), E = Ie(a / I), L)
        if (crypto.getRandomValues) {
          for (d = crypto.getRandomValues(new Uint32Array(E *= 2)); g < E; )
            h = d[g] * 131072 + (d[g + 1] >>> 11), h >= 9e15 ? (p = crypto.getRandomValues(new Uint32Array(2)), d[g] = p[0], d[g + 1] = p[1]) : (b.push(h % 1e14), g += 2);
          g = E / 2;
        } else if (crypto.randomBytes) {
          for (d = crypto.randomBytes(E *= 7); g < E; )
            h = (d[g] & 31) * 281474976710656 + d[g + 1] * 1099511627776 + d[g + 2] * 4294967296 + d[g + 3] * 16777216 + (d[g + 4] << 16) + (d[g + 5] << 8) + d[g + 6], h >= 9e15 ? crypto.randomBytes(7).copy(d, g) : (b.push(h % 1e14), g += 7);
          g = E / 7;
        } else
          throw L = !1, Error(Z + "crypto unavailable");
      if (!L)
        for (; g < E; )
          h = l(), h < 9e15 && (b[g++] = h % 1e14);
      for (E = b[--g], a %= I, E && a && (h = Be[I - a], b[g] = j(E / h) * h); b[g] === 0; b.pop(), g--) ;
      if (g < 0)
        b = [y = 0];
      else {
        for (y = -1; b[0] === 0; b.splice(0, 1), y -= I) ;
        for (g = 1, h = b[0]; h >= 10; h /= 10, g++) ;
        g < I && (y -= I - g);
      }
      return w.e = y, w.c = b, w;
    };
  })(), x.sum = function() {
    for (var s = 1, l = arguments, a = new x(l[0]); s < l.length; ) a = a.plus(l[s++]);
    return a;
  }, n = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function l(a, d, p, y) {
      for (var E, h = [0], g, b = 0, w = a.length; b < w; ) {
        for (g = h.length; g--; h[g] *= d) ;
        for (h[0] += y.indexOf(a.charAt(b++)), E = 0; E < h.length; E++)
          h[E] > p - 1 && (h[E + 1] == null && (h[E + 1] = 0), h[E + 1] += h[E] / p | 0, h[E] %= p);
      }
      return h.reverse();
    }
    return function(a, d, p, y, E) {
      var h, g, b, w, M, _, R, q, V = a.indexOf("."), X = u, G = c;
      for (V >= 0 && (w = N, N = 0, a = a.replace(".", ""), q = new x(d), _ = q.pow(a.length - V), N = w, q.c = l(
        le(Q(_.c), _.e, "0"),
        10,
        p,
        s
      ), q.e = q.c.length), R = l(a, d, p, E ? (h = B, s) : (h = s, B)), b = w = R.length; R[--w] == 0; R.pop()) ;
      if (!R[0]) return h.charAt(0);
      if (V < 0 ? --b : (_.c = R, _.e = b, _.s = y, _ = e(_, q, X, G, p), R = _.c, M = _.r, b = _.e), g = b + X + 1, V = R[g], w = p / 2, M = M || g < 0 || R[g + 1] != null, M = G < 4 ? (V != null || M) && (G == 0 || G == (_.s < 0 ? 3 : 2)) : V > w || V == w && (G == 4 || M || G == 6 && R[g - 1] & 1 || G == (_.s < 0 ? 8 : 7)), g < 1 || !R[0])
        a = M ? le(h.charAt(1), -X, h.charAt(0)) : h.charAt(0);
      else {
        if (R.length = g, M)
          for (--p; ++R[--g] > p; )
            R[g] = 0, g || (++b, R = [1].concat(R));
        for (w = R.length; !R[--w]; ) ;
        for (V = 0, a = ""; V <= w; a += h.charAt(R[V++])) ;
        a = le(a, b, h.charAt(0));
      }
      return a;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(d, p, y) {
      var E, h, g, b, w = 0, M = d.length, _ = p % fe, R = p / fe | 0;
      for (d = d.slice(); M--; )
        g = d[M] % fe, b = d[M] / fe | 0, E = R * g + b * _, h = _ * g + E % fe * fe + w, w = (h / y | 0) + (E / fe | 0) + R * b, d[M] = h % y;
      return w && (d = [w].concat(d)), d;
    }
    function l(d, p, y, E) {
      var h, g;
      if (y != E)
        g = y > E ? 1 : -1;
      else
        for (h = g = 0; h < y; h++)
          if (d[h] != p[h]) {
            g = d[h] > p[h] ? 1 : -1;
            break;
          }
      return g;
    }
    function a(d, p, y, E) {
      for (var h = 0; y--; )
        d[y] -= h, h = d[y] < p[y] ? 1 : 0, d[y] = h * E + d[y] - p[y];
      for (; !d[0] && d.length > 1; d.splice(0, 1)) ;
    }
    return function(d, p, y, E, h) {
      var g, b, w, M, _, R, q, V, X, G, U, K, be, Ce, Fe, re, ge, W = d.s == p.s ? 1 : -1, J = d.c, H = p.c;
      if (!J || !J[0] || !H || !H[0])
        return new x(
          // Return NaN if either NaN, or both Infinity or 0.
          !d.s || !p.s || (J ? H && J[0] == H[0] : !H) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            J && J[0] == 0 || !H ? W * 0 : W / 0
          )
        );
      for (V = new x(W), X = V.c = [], b = d.e - p.e, W = y + b + 1, h || (h = te, b = ee(d.e / I) - ee(p.e / I), W = W / I | 0), w = 0; H[w] == (J[w] || 0); w++) ;
      if (H[w] > (J[w] || 0) && b--, W < 0)
        X.push(1), M = !0;
      else {
        for (Ce = J.length, re = H.length, w = 0, W += 2, _ = j(h / (H[0] + 1)), _ > 1 && (H = s(H, _, h), J = s(J, _, h), re = H.length, Ce = J.length), be = re, G = J.slice(0, re), U = G.length; U < re; G[U++] = 0) ;
        ge = H.slice(), ge = [0].concat(ge), Fe = H[0], H[1] >= h / 2 && Fe++;
        do {
          if (_ = 0, g = l(H, G, re, U), g < 0) {
            if (K = G[0], re != U && (K = K * h + (G[1] || 0)), _ = j(K / Fe), _ > 1)
              for (_ >= h && (_ = h - 1), R = s(H, _, h), q = R.length, U = G.length; l(R, G, q, U) == 1; )
                _--, a(R, re < q ? ge : H, q, h), q = R.length, g = 1;
            else
              _ == 0 && (g = _ = 1), R = H.slice(), q = R.length;
            if (q < U && (R = [0].concat(R)), a(G, R, U, h), U = G.length, g == -1)
              for (; l(H, G, re, U) < 1; )
                _++, a(G, re < U ? ge : H, U, h), U = G.length;
          } else g === 0 && (_++, G = [0]);
          X[w++] = _, G[0] ? G[U++] = J[be] || 0 : (G = [J[be]], U = 1);
        } while ((be++ < Ce || G[0] != null) && W--);
        M = G[0] != null, X[0] || X.splice(0, 1);
      }
      if (h == te) {
        for (w = 1, W = X[0]; W >= 10; W /= 10, w++) ;
        C(V, y + (V.e = w + b * I - 1) + 1, E, M);
      } else
        V.e = b, V.r = +M;
      return V;
    };
  })();
  function T(s, l, a, d) {
    var p, y, E, h, g;
    if (a == null ? a = c : $(a, 0, 8), !s.c) return s.toString();
    if (p = s.c[0], E = s.e, l == null)
      g = Q(s.c), g = d == 1 || d == 2 && (E <= m || E >= f) ? ve(g, E) : le(g, E, "0");
    else if (s = C(new x(s), l, a), y = s.e, g = Q(s.c), h = g.length, d == 1 || d == 2 && (l <= y || y <= m)) {
      for (; h < l; g += "0", h++) ;
      g = ve(g, y);
    } else if (l -= E + (d === 2 && y > E), g = le(g, y, "0"), y + 1 > h) {
      if (--l > 0) for (g += "."; l--; g += "0") ;
    } else if (l += y - h, l > 0)
      for (y + 1 == h && (g += "."); l--; g += "0") ;
    return s.s < 0 && p ? "-" + g : g;
  }
  function k(s, l) {
    for (var a, d, p = 1, y = new x(s[0]); p < s.length; p++)
      d = new x(s[p]), (!d.s || (a = ce(y, d)) === l || a === 0 && y.s === l) && (y = d);
    return y;
  }
  function D(s, l, a) {
    for (var d = 1, p = l.length; !l[--p]; l.pop()) ;
    for (p = l[0]; p >= 10; p /= 10, d++) ;
    return (a = d + a * I - 1) > S ? s.c = s.e = null : a < v ? s.c = [s.e = 0] : (s.e = a, s.c = l), s;
  }
  r = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, l = /^([^.]+)\\.$/, a = /^\\.([^.]+)$/, d = /^-?(Infinity|NaN)$/, p = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(y, E, h, g) {
      var b, w = h ? E : E.replace(p, "");
      if (d.test(w))
        y.s = isNaN(w) ? null : w < 0 ? -1 : 1;
      else {
        if (!h && (w = w.replace(s, function(M, _, R) {
          return b = (R = R.toLowerCase()) == "x" ? 16 : R == "b" ? 2 : 8, !g || g == b ? _ : M;
        }), g && (b = g, w = w.replace(l, "$1").replace(a, "0.$1")), E != w))
          return new x(w, b);
        if (x.DEBUG)
          throw Error(Z + "Not a" + (g ? " base " + g : "") + " number: " + E);
        y.s = null;
      }
      y.c = y.e = null;
    };
  })();
  function C(s, l, a, d) {
    var p, y, E, h, g, b, w, M = s.c, _ = Be;
    if (M) {
      e: {
        for (p = 1, h = M[0]; h >= 10; h /= 10, p++) ;
        if (y = l - p, y < 0)
          y += I, E = l, g = M[b = 0], w = j(g / _[p - E - 1] % 10);
        else if (b = Ie((y + 1) / I), b >= M.length)
          if (d) {
            for (; M.length <= b; M.push(0)) ;
            g = w = 0, p = 1, y %= I, E = y - I + 1;
          } else
            break e;
        else {
          for (g = h = M[b], p = 1; h >= 10; h /= 10, p++) ;
          y %= I, E = y - I + p, w = E < 0 ? 0 : j(g / _[p - E - 1] % 10);
        }
        if (d = d || l < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        M[b + 1] != null || (E < 0 ? g : g % _[p - E - 1]), d = a < 4 ? (w || d) && (a == 0 || a == (s.s < 0 ? 3 : 2)) : w > 5 || w == 5 && (a == 4 || d || a == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? E > 0 ? g / _[p - E] : 0 : M[b - 1]) % 10 & 1 || a == (s.s < 0 ? 8 : 7)), l < 1 || !M[0])
          return M.length = 0, d ? (l -= s.e + 1, M[0] = _[(I - l % I) % I], s.e = -l || 0) : M[0] = s.e = 0, s;
        if (y == 0 ? (M.length = b, h = 1, b--) : (M.length = b + 1, h = _[I - y], M[b] = E > 0 ? j(g / _[p - E] % _[E]) * h : 0), d)
          for (; ; )
            if (b == 0) {
              for (y = 1, E = M[0]; E >= 10; E /= 10, y++) ;
              for (E = M[0] += h, h = 1; E >= 10; E /= 10, h++) ;
              y != h && (s.e++, M[0] == te && (M[0] = 1));
              break;
            } else {
              if (M[b] += h, M[b] != te) break;
              M[b--] = 0, h = 1;
            }
        for (y = M.length; M[--y] === 0; M.pop()) ;
      }
      s.e > S ? s.c = s.e = null : s.e < v && (s.c = [s.e = 0]);
    }
    return s;
  }
  function F(s) {
    var l, a = s.e;
    return a === null ? s.toString() : (l = Q(s.c), l = a <= m || a >= f ? ve(l, a) : le(l, a, "0"), s.s < 0 ? "-" + l : l);
  }
  return i.absoluteValue = i.abs = function() {
    var s = new x(this);
    return s.s < 0 && (s.s = 1), s;
  }, i.comparedTo = function(s, l) {
    return ce(this, new x(s, l));
  }, i.decimalPlaces = i.dp = function(s, l) {
    var a, d, p, y = this;
    if (s != null)
      return $(s, 0, Y), l == null ? l = c : $(l, 0, 8), C(new x(y), s + y.e + 1, l);
    if (!(a = y.c)) return null;
    if (d = ((p = a.length - 1) - ee(this.e / I)) * I, p = a[p]) for (; p % 10 == 0; p /= 10, d--) ;
    return d < 0 && (d = 0), d;
  }, i.dividedBy = i.div = function(s, l) {
    return e(this, new x(s, l), u, c);
  }, i.dividedToIntegerBy = i.idiv = function(s, l) {
    return e(this, new x(s, l), 0, 1);
  }, i.exponentiatedBy = i.pow = function(s, l) {
    var a, d, p, y, E, h, g, b, w, M = this;
    if (s = new x(s), s.c && !s.isInteger())
      throw Error(Z + "Exponent not an integer: " + F(s));
    if (l != null && (l = new x(l)), h = s.e > 14, !M.c || !M.c[0] || M.c[0] == 1 && !M.e && M.c.length == 1 || !s.c || !s.c[0])
      return w = new x(Math.pow(+F(M), h ? s.s * (2 - Ee(s)) : +F(s))), l ? w.mod(l) : w;
    if (g = s.s < 0, l) {
      if (l.c ? !l.c[0] : !l.s) return new x(NaN);
      d = !g && M.isInteger() && l.isInteger(), d && (M = M.mod(l));
    } else {
      if (s.e > 9 && (M.e > 0 || M.e < -1 || (M.e == 0 ? M.c[0] > 1 || h && M.c[1] >= 24e7 : M.c[0] < 8e13 || h && M.c[0] <= 9999975e7)))
        return y = M.s < 0 && Ee(s) ? -0 : 0, M.e > -1 && (y = 1 / y), new x(g ? 1 / y : y);
      N && (y = Ie(N / I + 2));
    }
    for (h ? (a = new x(0.5), g && (s.s = 1), b = Ee(s)) : (p = Math.abs(+F(s)), b = p % 2), w = new x(o); ; ) {
      if (b) {
        if (w = w.times(M), !w.c) break;
        y ? w.c.length > y && (w.c.length = y) : d && (w = w.mod(l));
      }
      if (p) {
        if (p = j(p / 2), p === 0) break;
        b = p % 2;
      } else if (s = s.times(a), C(s, s.e + 1, 1), s.e > 14)
        b = Ee(s);
      else {
        if (p = +F(s), p === 0) break;
        b = p % 2;
      }
      M = M.times(M), y ? M.c && M.c.length > y && (M.c.length = y) : d && (M = M.mod(l));
    }
    return d ? w : (g && (w = o.div(w)), l ? w.mod(l) : y ? C(w, N, c, E) : w);
  }, i.integerValue = function(s) {
    var l = new x(this);
    return s == null ? s = c : $(s, 0, 8), C(l, l.e + 1, s);
  }, i.isEqualTo = i.eq = function(s, l) {
    return ce(this, new x(s, l)) === 0;
  }, i.isFinite = function() {
    return !!this.c;
  }, i.isGreaterThan = i.gt = function(s, l) {
    return ce(this, new x(s, l)) > 0;
  }, i.isGreaterThanOrEqualTo = i.gte = function(s, l) {
    return (l = ce(this, new x(s, l))) === 1 || l === 0;
  }, i.isInteger = function() {
    return !!this.c && ee(this.e / I) > this.c.length - 2;
  }, i.isLessThan = i.lt = function(s, l) {
    return ce(this, new x(s, l)) < 0;
  }, i.isLessThanOrEqualTo = i.lte = function(s, l) {
    return (l = ce(this, new x(s, l))) === -1 || l === 0;
  }, i.isNaN = function() {
    return !this.s;
  }, i.isNegative = function() {
    return this.s < 0;
  }, i.isPositive = function() {
    return this.s > 0;
  }, i.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, i.minus = function(s, l) {
    var a, d, p, y, E = this, h = E.s;
    if (s = new x(s, l), l = s.s, !h || !l) return new x(NaN);
    if (h != l)
      return s.s = -l, E.plus(s);
    var g = E.e / I, b = s.e / I, w = E.c, M = s.c;
    if (!g || !b) {
      if (!w || !M) return w ? (s.s = -l, s) : new x(M ? E : NaN);
      if (!w[0] || !M[0])
        return M[0] ? (s.s = -l, s) : new x(w[0] ? E : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          c == 3 ? -0 : 0
        ));
    }
    if (g = ee(g), b = ee(b), w = w.slice(), h = g - b) {
      for ((y = h < 0) ? (h = -h, p = w) : (b = g, p = M), p.reverse(), l = h; l--; p.push(0)) ;
      p.reverse();
    } else
      for (d = (y = (h = w.length) < (l = M.length)) ? h : l, h = l = 0; l < d; l++)
        if (w[l] != M[l]) {
          y = w[l] < M[l];
          break;
        }
    if (y && (p = w, w = M, M = p, s.s = -s.s), l = (d = M.length) - (a = w.length), l > 0) for (; l--; w[a++] = 0) ;
    for (l = te - 1; d > h; ) {
      if (w[--d] < M[d]) {
        for (a = d; a && !w[--a]; w[a] = l) ;
        --w[a], w[d] += te;
      }
      w[d] -= M[d];
    }
    for (; w[0] == 0; w.splice(0, 1), --b) ;
    return w[0] ? D(s, w, b) : (s.s = c == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, i.modulo = i.mod = function(s, l) {
    var a, d, p = this;
    return s = new x(s, l), !p.c || !s.s || s.c && !s.c[0] ? new x(NaN) : !s.c || p.c && !p.c[0] ? new x(p) : (P == 9 ? (d = s.s, s.s = 1, a = e(p, s, 0, 3), s.s = d, a.s *= d) : a = e(p, s, 0, P), s = p.minus(a.times(s)), !s.c[0] && P == 1 && (s.s = p.s), s);
  }, i.multipliedBy = i.times = function(s, l) {
    var a, d, p, y, E, h, g, b, w, M, _, R, q, V, X, G = this, U = G.c, K = (s = new x(s, l)).c;
    if (!U || !K || !U[0] || !K[0])
      return !G.s || !s.s || U && !U[0] && !K || K && !K[0] && !U ? s.c = s.e = s.s = null : (s.s *= G.s, !U || !K ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (d = ee(G.e / I) + ee(s.e / I), s.s *= G.s, g = U.length, M = K.length, g < M && (q = U, U = K, K = q, p = g, g = M, M = p), p = g + M, q = []; p--; q.push(0)) ;
    for (V = te, X = fe, p = M; --p >= 0; ) {
      for (a = 0, _ = K[p] % X, R = K[p] / X | 0, E = g, y = p + E; y > p; )
        b = U[--E] % X, w = U[E] / X | 0, h = R * b + w * _, b = _ * b + h % X * X + q[y] + a, a = (b / V | 0) + (h / X | 0) + R * w, q[y--] = b % V;
      q[y] = a;
    }
    return a ? ++d : q.splice(0, 1), D(s, q, d);
  }, i.negated = function() {
    var s = new x(this);
    return s.s = -s.s || null, s;
  }, i.plus = function(s, l) {
    var a, d = this, p = d.s;
    if (s = new x(s, l), l = s.s, !p || !l) return new x(NaN);
    if (p != l)
      return s.s = -l, d.minus(s);
    var y = d.e / I, E = s.e / I, h = d.c, g = s.c;
    if (!y || !E) {
      if (!h || !g) return new x(p / 0);
      if (!h[0] || !g[0]) return g[0] ? s : new x(h[0] ? d : p * 0);
    }
    if (y = ee(y), E = ee(E), h = h.slice(), p = y - E) {
      for (p > 0 ? (E = y, a = g) : (p = -p, a = h), a.reverse(); p--; a.push(0)) ;
      a.reverse();
    }
    for (p = h.length, l = g.length, p - l < 0 && (a = g, g = h, h = a, l = p), p = 0; l; )
      p = (h[--l] = h[l] + g[l] + p) / te | 0, h[l] = te === h[l] ? 0 : h[l] % te;
    return p && (h = [p].concat(h), ++E), D(s, h, E);
  }, i.precision = i.sd = function(s, l) {
    var a, d, p, y = this;
    if (s != null && s !== !!s)
      return $(s, 1, Y), l == null ? l = c : $(l, 0, 8), C(new x(y), s, l);
    if (!(a = y.c)) return null;
    if (p = a.length - 1, d = p * I + 1, p = a[p]) {
      for (; p % 10 == 0; p /= 10, d--) ;
      for (p = a[0]; p >= 10; p /= 10, d++) ;
    }
    return s && y.e + 1 > d && (d = y.e + 1), d;
  }, i.shiftedBy = function(s) {
    return $(s, -ke, ke), this.times("1e" + s);
  }, i.squareRoot = i.sqrt = function() {
    var s, l, a, d, p, y = this, E = y.c, h = y.s, g = y.e, b = u + 4, w = new x("0.5");
    if (h !== 1 || !E || !E[0])
      return new x(!h || h < 0 && (!E || E[0]) ? NaN : E ? y : 1 / 0);
    if (h = Math.sqrt(+F(y)), h == 0 || h == 1 / 0 ? (l = Q(E), (l.length + g) % 2 == 0 && (l += "0"), h = Math.sqrt(+l), g = ee((g + 1) / 2) - (g < 0 || g % 2), h == 1 / 0 ? l = "5e" + g : (l = h.toExponential(), l = l.slice(0, l.indexOf("e") + 1) + g), a = new x(l)) : a = new x(h + ""), a.c[0]) {
      for (g = a.e, h = g + b, h < 3 && (h = 0); ; )
        if (p = a, a = w.times(p.plus(e(y, p, b, 1))), Q(p.c).slice(0, h) === (l = Q(a.c)).slice(0, h))
          if (a.e < g && --h, l = l.slice(h - 3, h + 1), l == "9999" || !d && l == "4999") {
            if (!d && (C(p, p.e + u + 2, 0), p.times(p).eq(y))) {
              a = p;
              break;
            }
            b += 4, h += 4, d = 1;
          } else {
            (!+l || !+l.slice(1) && l.charAt(0) == "5") && (C(a, a.e + u + 2, 1), s = !a.times(a).eq(y));
            break;
          }
    }
    return C(a, a.e + u + 1, c, s);
  }, i.toExponential = function(s, l) {
    return s != null && ($(s, 0, Y), s++), T(this, s, l, 1);
  }, i.toFixed = function(s, l) {
    return s != null && ($(s, 0, Y), s = s + this.e + 1), T(this, s, l);
  }, i.toFormat = function(s, l, a) {
    var d, p = this;
    if (a == null)
      s != null && l && typeof l == "object" ? (a = l, l = null) : s && typeof s == "object" ? (a = s, s = l = null) : a = A;
    else if (typeof a != "object")
      throw Error(Z + "Argument not an object: " + a);
    if (d = p.toFixed(s, l), p.c) {
      var y, E = d.split("."), h = +a.groupSize, g = +a.secondaryGroupSize, b = a.groupSeparator || "", w = E[0], M = E[1], _ = p.s < 0, R = _ ? w.slice(1) : w, q = R.length;
      if (g && (y = h, h = g, g = y, q -= y), h > 0 && q > 0) {
        for (y = q % h || h, w = R.substr(0, y); y < q; y += h) w += b + R.substr(y, h);
        g > 0 && (w += b + R.slice(y)), _ && (w = "-" + w);
      }
      d = M ? w + (a.decimalSeparator || "") + ((g = +a.fractionGroupSize) ? M.replace(
        new RegExp("\\\\d{" + g + "}\\\\B", "g"),
        "$&" + (a.fractionGroupSeparator || "")
      ) : M) : w;
    }
    return (a.prefix || "") + d + (a.suffix || "");
  }, i.toFraction = function(s) {
    var l, a, d, p, y, E, h, g, b, w, M, _, R = this, q = R.c;
    if (s != null && (h = new x(s), !h.isInteger() && (h.c || h.s !== 1) || h.lt(o)))
      throw Error(Z + "Argument " + (h.isInteger() ? "out of range: " : "not an integer: ") + F(h));
    if (!q) return new x(R);
    for (l = new x(o), b = a = new x(o), d = g = new x(o), _ = Q(q), y = l.e = _.length - R.e - 1, l.c[0] = Be[(E = y % I) < 0 ? I + E : E], s = !s || h.comparedTo(l) > 0 ? y > 0 ? l : b : h, E = S, S = 1 / 0, h = new x(_), g.c[0] = 0; w = e(h, l, 0, 1), p = a.plus(w.times(d)), p.comparedTo(s) != 1; )
      a = d, d = p, b = g.plus(w.times(p = b)), g = p, l = h.minus(w.times(p = l)), h = p;
    return p = e(s.minus(a), d, 0, 1), g = g.plus(p.times(b)), a = a.plus(p.times(d)), g.s = b.s = R.s, y = y * 2, M = e(b, d, y, c).minus(R).abs().comparedTo(
      e(g, a, y, c).minus(R).abs()
    ) < 1 ? [b, d] : [g, a], S = E, M;
  }, i.toNumber = function() {
    return +F(this);
  }, i.toPrecision = function(s, l) {
    return s != null && $(s, 1, Y), T(this, s, l, 2);
  }, i.toString = function(s) {
    var l, a = this, d = a.s, p = a.e;
    return p === null ? d ? (l = "Infinity", d < 0 && (l = "-" + l)) : l = "NaN" : (s == null ? l = p <= m || p >= f ? ve(Q(a.c), p) : le(Q(a.c), p, "0") : s === 10 && O ? (a = C(new x(a), u + p + 1, c), l = le(Q(a.c), a.e, "0")) : ($(s, 2, B.length, "Base"), l = n(le(Q(a.c), p, "0"), 10, s, d, !0)), d < 0 && a.c[0] && (l = "-" + l)), l;
  }, i.valueOf = i.toJSON = function() {
    return F(this);
  }, i._isBigNumber = !0, i[Symbol.toStringTag] = "BigNumber", i[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = i.valueOf, t != null && x.set(t), x;
}
function ee(t) {
  var e = t | 0;
  return t > 0 || t === e ? e : e - 1;
}
function Q(t) {
  for (var e, n, r = 1, i = t.length, o = t[0] + ""; r < i; ) {
    for (e = t[r++] + "", n = I - e.length; n--; e = "0" + e) ;
    o += e;
  }
  for (i = o.length; o.charCodeAt(--i) === 48; ) ;
  return o.slice(0, i + 1 || 1);
}
function ce(t, e) {
  var n, r, i = t.c, o = e.c, u = t.s, c = e.s, m = t.e, f = e.e;
  if (!u || !c) return null;
  if (n = i && !i[0], r = o && !o[0], n || r) return n ? r ? 0 : -c : u;
  if (u != c) return u;
  if (n = u < 0, r = m == f, !i || !o) return r ? 0 : !i ^ n ? 1 : -1;
  if (!r) return m > f ^ n ? 1 : -1;
  for (c = (m = i.length) < (f = o.length) ? m : f, u = 0; u < c; u++) if (i[u] != o[u]) return i[u] > o[u] ^ n ? 1 : -1;
  return m == f ? 0 : m > f ^ n ? 1 : -1;
}
function $(t, e, n, r) {
  if (t < e || t > n || t !== j(t))
    throw Error(Z + (r || "Argument") + (typeof t == "number" ? t < e || t > n ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(t));
}
function Ee(t) {
  var e = t.c.length - 1;
  return ee(t.e / I) == e && t.c[e] % 2 != 0;
}
function ve(t, e) {
  return (t.length > 1 ? t.charAt(0) + "." + t.slice(1) : t) + (e < 0 ? "e" : "e+") + e;
}
function le(t, e, n) {
  var r, i;
  if (e < 0) {
    for (i = n + "."; ++e; i += n) ;
    t = i + t;
  } else if (r = t.length, ++e > r) {
    for (i = n, e -= r; --e; i += n) ;
    t += i;
  } else e < r && (t = t.slice(0, e) + "." + t.slice(e));
  return t;
}
var oe = ct(), St = class {
  key;
  left = null;
  right = null;
  constructor(t) {
    this.key = t;
  }
}, ye = class extends St {
  constructor(t) {
    super(t);
  }
}, Mt = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(t) {
    const e = this.root;
    if (e == null)
      return this.compare(t, t), -1;
    let n = null, r = null, i = null, o = null, u = e;
    const c = this.compare;
    let m;
    for (; ; )
      if (m = c(u.key, t), m > 0) {
        let f = u.left;
        if (f == null || (m = c(f.key, t), m > 0 && (u.left = f.right, f.right = u, u = f, f = u.left, f == null)))
          break;
        n == null ? r = u : n.left = u, n = u, u = f;
      } else if (m < 0) {
        let f = u.right;
        if (f == null || (m = c(f.key, t), m < 0 && (u.right = f.left, f.left = u, u = f, f = u.right, f == null)))
          break;
        i == null ? o = u : i.right = u, i = u, u = f;
      } else
        break;
    return i != null && (i.right = u.left, u.left = o), n != null && (n.left = u.right, u.right = r), this.root !== u && (this.root = u, this.splayCount++), m;
  }
  splayMin(t) {
    let e = t, n = e.left;
    for (; n != null; ) {
      const r = n;
      e.left = r.right, r.right = e, e = r, n = e.left;
    }
    return e;
  }
  splayMax(t) {
    let e = t, n = e.right;
    for (; n != null; ) {
      const r = n;
      e.right = r.left, r.left = e, e = r, n = e.right;
    }
    return e;
  }
  _delete(t) {
    if (this.root == null || this.splay(t) != 0) return null;
    let n = this.root;
    const r = n, i = n.left;
    if (this.size--, i == null)
      this.root = n.right;
    else {
      const o = n.right;
      n = this.splayMax(i), n.right = o, this.root = n;
    }
    return this.modificationCount++, r;
  }
  addNewRoot(t, e) {
    this.size++, this.modificationCount++;
    const n = this.root;
    if (n == null) {
      this.root = t;
      return;
    }
    e < 0 ? (t.left = n, t.right = n.right, n.right = null) : (t.right = n, t.left = n.left, n.left = null), this.root = t;
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
}, Le = class me extends Mt {
  root = null;
  compare;
  validKey;
  constructor(e, n) {
    super(), this.compare = e ?? this.defaultCompare(), this.validKey = n ?? ((r) => r != null && r != null);
  }
  delete(e) {
    return this.validKey(e) ? this._delete(e) != null : !1;
  }
  deleteAll(e) {
    for (const n of e)
      this.delete(n);
  }
  forEach(e) {
    const n = this[Symbol.iterator]();
    let r;
    for (; r = n.next(), !r.done; )
      e(r.value, r.value, this);
  }
  add(e) {
    const n = this.splay(e);
    return n != 0 && this.addNewRoot(new ye(e), n), this;
  }
  addAndReturn(e) {
    const n = this.splay(e);
    return n != 0 && this.addNewRoot(new ye(e), n), this.root.key;
  }
  addAll(e) {
    for (const n of e)
      this.add(n);
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
    let r = this.root.left;
    if (r == null) return null;
    let i = r.right;
    for (; i != null; )
      r = i, i = r.right;
    return r.key;
  }
  firstAfter(e) {
    if (e == null) throw "Invalid arguments(s)";
    if (this.root == null) return null;
    if (this.splay(e) > 0) return this.root.key;
    let r = this.root.right;
    if (r == null) return null;
    let i = r.left;
    for (; i != null; )
      r = i, i = r.left;
    return r.key;
  }
  retainAll(e) {
    const n = new me(this.compare, this.validKey), r = this.modificationCount;
    for (const i of e) {
      if (r != this.modificationCount)
        throw "Concurrent modification during iteration.";
      this.validKey(i) && this.splay(i) == 0 && n.add(this.root.key);
    }
    n.size != this.size && (this.root = n.root, this.size = n.size, this.modificationCount++);
  }
  lookup(e) {
    return !this.validKey(e) || this.splay(e) != 0 ? null : this.root.key;
  }
  intersection(e) {
    const n = new me(this.compare, this.validKey);
    for (const r of this)
      e.has(r) && n.add(r);
    return n;
  }
  difference(e) {
    const n = new me(this.compare, this.validKey);
    for (const r of this)
      e.has(r) || n.add(r);
    return n;
  }
  union(e) {
    const n = this.clone();
    return n.addAll(e), n;
  }
  clone() {
    const e = new me(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function n(i, o) {
      let u, c;
      do {
        if (u = i.left, c = i.right, u != null) {
          const m = new ye(u.key);
          o.left = m, n(u, m);
        }
        if (c != null) {
          const m = new ye(c.key);
          o.right = m, i = c, o = m;
        }
      } while (c != null);
    }
    const r = new ye(e.key);
    return n(e, r), r;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new At(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new Pt(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, ht = class {
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
        let n = this.tree.getRoot();
        for (; n != null; )
          this.path.push(n), n = n.left;
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
}, Pt = class extends ht {
  getValue(t) {
    return t.key;
  }
}, At = class extends ht {
  getValue(t) {
    return [t.key, t.key];
  }
}, pt = (t) => () => t, De = (t) => {
  const e = t ? (n, r) => r.minus(n).abs().isLessThanOrEqualTo(t) : pt(!1);
  return (n, r) => e(n, r) ? 0 : n.comparedTo(r);
};
function Lt(t) {
  const e = t ? (n, r, i, o, u) => n.exponentiatedBy(2).isLessThanOrEqualTo(
    o.minus(r).exponentiatedBy(2).plus(u.minus(i).exponentiatedBy(2)).times(t)
  ) : pt(!1);
  return (n, r, i) => {
    const o = n.x, u = n.y, c = i.x, m = i.y, f = u.minus(m).times(r.x.minus(c)).minus(o.minus(c).times(r.y.minus(m)));
    return e(f, o, u, c, m) ? 0 : f.comparedTo(0);
  };
}
var Nt = (t) => t, Tt = (t) => {
  if (t) {
    const e = new Le(De(t)), n = new Le(De(t)), r = (o, u) => u.addAndReturn(o), i = (o) => ({
      x: r(o.x, e),
      y: r(o.y, n)
    });
    return i({ x: new oe(0), y: new oe(0) }), i;
  }
  return Nt;
}, Ue = (t) => ({
  set: (e) => {
    ue = Ue(e);
  },
  reset: () => Ue(t),
  compare: De(t),
  snap: Tt(t),
  orient: Lt(t)
}), ue = Ue(), de = (t, e) => t.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(t.ur.x) && t.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(t.ur.y), ze = (t, e) => {
  if (e.ur.x.isLessThan(t.ll.x) || t.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(t.ll.y) || t.ur.y.isLessThan(e.ll.y))
    return null;
  const n = t.ll.x.isLessThan(e.ll.x) ? e.ll.x : t.ll.x, r = t.ur.x.isLessThan(e.ur.x) ? t.ur.x : e.ur.x, i = t.ll.y.isLessThan(e.ll.y) ? e.ll.y : t.ll.y, o = t.ur.y.isLessThan(e.ur.y) ? t.ur.y : e.ur.y;
  return { ll: { x: n, y: i }, ur: { x: r, y: o } };
}, Pe = (t, e) => t.x.times(e.y).minus(t.y.times(e.x)), gt = (t, e) => t.x.times(e.x).plus(t.y.times(e.y)), Ne = (t) => gt(t, t).sqrt(), Ot = (t, e, n) => {
  const r = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: n.x.minus(t.x), y: n.y.minus(t.y) };
  return Pe(i, r).div(Ne(i)).div(Ne(r));
}, _t = (t, e, n) => {
  const r = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: n.x.minus(t.x), y: n.y.minus(t.y) };
  return gt(i, r).div(Ne(i)).div(Ne(r));
}, Je = (t, e, n) => e.y.isZero() ? null : { x: t.x.plus(e.x.div(e.y).times(n.minus(t.y))), y: n }, Ze = (t, e, n) => e.x.isZero() ? null : { x: n, y: t.y.plus(e.y.div(e.x).times(n.minus(t.x))) }, Rt = (t, e, n, r) => {
  if (e.x.isZero()) return Ze(n, r, t.x);
  if (r.x.isZero()) return Ze(t, e, n.x);
  if (e.y.isZero()) return Je(n, r, t.y);
  if (r.y.isZero()) return Je(t, e, n.y);
  const i = Pe(e, r);
  if (i.isZero()) return null;
  const o = { x: n.x.minus(t.x), y: n.y.minus(t.y) }, u = Pe(o, e).div(i), c = Pe(o, r).div(i), m = t.x.plus(c.times(e.x)), f = n.x.plus(u.times(r.x)), v = t.y.plus(c.times(e.y)), S = n.y.plus(u.times(r.y)), L = m.plus(f).div(2), P = v.plus(S).div(2);
  return { x: L, y: P };
}, se = class yt {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, n) {
    const r = yt.comparePoints(e.point, n.point);
    return r !== 0 ? r : (e.point !== n.point && e.link(n), e.isLeft !== n.isLeft ? e.isLeft ? 1 : -1 : Te.compare(e.segment, n.segment));
  }
  // for ordering points in sweep line order
  static comparePoints(e, n) {
    return e.x.isLessThan(n.x) ? -1 : e.x.isGreaterThan(n.x) ? 1 : e.y.isLessThan(n.y) ? -1 : e.y.isGreaterThan(n.y) ? 1 : 0;
  }
  // Warning: 'point' input will be modified and re-used (for performance)
  constructor(e, n) {
    e.events === void 0 ? e.events = [this] : e.events.push(this), this.point = e, this.isLeft = n;
  }
  link(e) {
    if (e.point === this.point)
      throw new Error("Tried to link already linked events");
    const n = e.point.events;
    for (let r = 0, i = n.length; r < i; r++) {
      const o = n[r];
      this.point.events.push(o), o.point = this.point;
    }
    this.checkForConsuming();
  }
  /* Do a pass over our linked events and check to see if any pair
   * of segments match, and should be consumed. */
  checkForConsuming() {
    const e = this.point.events.length;
    for (let n = 0; n < e; n++) {
      const r = this.point.events[n];
      if (r.segment.consumedBy === void 0)
        for (let i = n + 1; i < e; i++) {
          const o = this.point.events[i];
          o.consumedBy === void 0 && r.otherSE.point.events === o.otherSE.point.events && r.segment.consume(o.segment);
        }
    }
  }
  getAvailableLinkedEvents() {
    const e = [];
    for (let n = 0, r = this.point.events.length; n < r; n++) {
      const i = this.point.events[n];
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
    const n = /* @__PURE__ */ new Map(), r = (i) => {
      const o = i.otherSE;
      n.set(i, {
        sine: Ot(this.point, e.point, o.point),
        cosine: _t(this.point, e.point, o.point)
      });
    };
    return (i, o) => {
      n.has(i) || r(i), n.has(o) || r(o);
      const { sine: u, cosine: c } = n.get(i), { sine: m, cosine: f } = n.get(o);
      return u.isGreaterThanOrEqualTo(0) && m.isGreaterThanOrEqualTo(0) ? c.isLessThan(f) ? 1 : c.isGreaterThan(f) ? -1 : 0 : u.isLessThan(0) && m.isLessThan(0) ? c.isLessThan(f) ? -1 : c.isGreaterThan(f) ? 1 : 0 : m.isLessThan(u) ? -1 : m.isGreaterThan(u) ? 1 : 0;
    };
  }
}, Ct = class $e {
  events;
  poly;
  _isExteriorRing;
  _enclosingRing;
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory(e) {
    const n = [];
    for (let r = 0, i = e.length; r < i; r++) {
      const o = e[r];
      if (!o.isInResult() || o.ringOut) continue;
      let u = null, c = o.leftSE, m = o.rightSE;
      const f = [c], v = c.point, S = [];
      for (; u = c, c = m, f.push(c), c.point !== v; )
        for (; ; ) {
          const L = c.getAvailableLinkedEvents();
          if (L.length === 0) {
            const A = f[0].point, B = f[f.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${A.x}, \${A.y}]. Last matching segment found ends at [\${B.x}, \${B.y}].\`
            );
          }
          if (L.length === 1) {
            m = L[0].otherSE;
            break;
          }
          let P = null;
          for (let A = 0, B = S.length; A < B; A++)
            if (S[A].point === c.point) {
              P = A;
              break;
            }
          if (P !== null) {
            const A = S.splice(P)[0], B = f.splice(A.index);
            B.unshift(B[0].otherSE), n.push(new $e(B.reverse()));
            continue;
          }
          S.push({
            index: f.length,
            point: c.point
          });
          const N = c.getLeftmostComparator(u);
          m = L.sort(N)[0].otherSE;
          break;
        }
      n.push(new $e(f));
    }
    return n;
  }
  constructor(e) {
    this.events = e;
    for (let n = 0, r = e.length; n < r; n++)
      e[n].segment.ringOut = this;
    this.poly = null;
  }
  getGeom() {
    let e = this.events[0].point;
    const n = [e];
    for (let f = 1, v = this.events.length - 1; f < v; f++) {
      const S = this.events[f].point, L = this.events[f + 1].point;
      ue.orient(S, e, L) !== 0 && (n.push(S), e = S);
    }
    if (n.length === 1) return null;
    const r = n[0], i = n[1];
    ue.orient(r, e, i) === 0 && n.shift(), n.push(n[0]);
    const o = this.isExteriorRing() ? 1 : -1, u = this.isExteriorRing() ? 0 : n.length - 1, c = this.isExteriorRing() ? n.length : -1, m = [];
    for (let f = u; f != c; f += o)
      m.push([n[f].x.toNumber(), n[f].y.toNumber()]);
    return m;
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
      se.compare(e, u) > 0 && (e = u);
    }
    let n = e.segment.prevInResult(), r = n ? n.prevInResult() : null;
    for (; ; ) {
      if (!n) return null;
      if (!r) return n.ringOut;
      if (r.ringOut !== n.ringOut)
        return r.ringOut?.enclosingRing() !== n.ringOut ? n.ringOut : n.ringOut?.enclosingRing();
      n = r.prevInResult(), r = n ? n.prevInResult() : null;
    }
  }
}, We = class {
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
    for (let n = 0, r = this.interiorRings.length; n < r; n++) {
      const i = this.interiorRings[n].getGeom();
      i !== null && e.push(i);
    }
    return e;
  }
}, Ft = class {
  rings;
  polys;
  constructor(t) {
    this.rings = t, this.polys = this._composePolys(t);
  }
  getGeom() {
    const t = [];
    for (let e = 0, n = this.polys.length; e < n; e++) {
      const r = this.polys[e].getGeom();
      r !== null && t.push(r);
    }
    return t;
  }
  _composePolys(t) {
    const e = [];
    for (let n = 0, r = t.length; n < r; n++) {
      const i = t[n];
      if (!i.poly)
        if (i.isExteriorRing()) e.push(new We(i));
        else {
          const o = i.enclosingRing();
          o?.poly || e.push(new We(o)), o?.poly?.addInterior(i);
        }
    }
    return e;
  }
}, It = class {
  queue;
  tree;
  segments;
  constructor(t, e = Te.compare) {
    this.queue = t, this.tree = new Le(e), this.segments = [];
  }
  process(t) {
    const e = t.segment, n = [];
    if (t.consumedBy)
      return t.isLeft ? this.queue.delete(t.otherSE) : this.tree.delete(e), n;
    t.isLeft && this.tree.add(e);
    let r = e, i = e;
    do
      r = this.tree.lastBefore(r);
    while (r != null && r.consumedBy != null);
    do
      i = this.tree.firstAfter(i);
    while (i != null && i.consumedBy != null);
    if (t.isLeft) {
      let o = null;
      if (r) {
        const c = r.getIntersection(e);
        if (c !== null && (e.isAnEndpoint(c) || (o = c), !r.isAnEndpoint(c))) {
          const m = this._splitSafely(r, c);
          for (let f = 0, v = m.length; f < v; f++)
            n.push(m[f]);
        }
      }
      let u = null;
      if (i) {
        const c = i.getIntersection(e);
        if (c !== null && (e.isAnEndpoint(c) || (u = c), !i.isAnEndpoint(c))) {
          const m = this._splitSafely(i, c);
          for (let f = 0, v = m.length; f < v; f++)
            n.push(m[f]);
        }
      }
      if (o !== null || u !== null) {
        let c = null;
        o === null ? c = u : u === null ? c = o : c = se.comparePoints(
          o,
          u
        ) <= 0 ? o : u, this.queue.delete(e.rightSE), n.push(e.rightSE);
        const m = e.split(c);
        for (let f = 0, v = m.length; f < v; f++)
          n.push(m[f]);
      }
      n.length > 0 ? (this.tree.delete(e), n.push(t)) : (this.segments.push(e), e.prev = r);
    } else {
      if (r && i) {
        const o = r.getIntersection(i);
        if (o !== null) {
          if (!r.isAnEndpoint(o)) {
            const u = this._splitSafely(r, o);
            for (let c = 0, m = u.length; c < m; c++)
              n.push(u[c]);
          }
          if (!i.isAnEndpoint(o)) {
            const u = this._splitSafely(i, o);
            for (let c = 0, m = u.length; c < m; c++)
              n.push(u[c]);
          }
        }
      }
      this.tree.delete(e);
    }
    return n;
  }
  /* Safely split a segment that is currently in the datastructures
   * IE - a segment other than the one that is currently being processed. */
  _splitSafely(t, e) {
    this.tree.delete(t);
    const n = t.rightSE;
    this.queue.delete(n);
    const r = t.split(e);
    return r.push(n), t.consumedBy === void 0 && this.tree.add(t), r;
  }
}, kt = class {
  type;
  numMultiPolys;
  run(t, e, n) {
    xe.type = t;
    const r = [new je(e, !0)];
    for (let f = 0, v = n.length; f < v; f++)
      r.push(new je(n[f], !1));
    if (xe.numMultiPolys = r.length, xe.type === "difference") {
      const f = r[0];
      let v = 1;
      for (; v < r.length; )
        ze(r[v].bbox, f.bbox) !== null ? v++ : r.splice(v, 1);
    }
    if (xe.type === "intersection")
      for (let f = 0, v = r.length; f < v; f++) {
        const S = r[f];
        for (let L = f + 1, P = r.length; L < P; L++)
          if (ze(S.bbox, r[L].bbox) === null) return [];
      }
    const i = new Le(se.compare);
    for (let f = 0, v = r.length; f < v; f++) {
      const S = r[f].getSweepEvents();
      for (let L = 0, P = S.length; L < P; L++)
        i.add(S[L]);
    }
    const o = new It(i);
    let u = null;
    for (i.size != 0 && (u = i.first(), i.delete(u)); u; ) {
      const f = o.process(u);
      for (let v = 0, S = f.length; v < S; v++) {
        const L = f[v];
        L.consumedBy === void 0 && i.add(L);
      }
      i.size != 0 ? (u = i.first(), i.delete(u)) : u = null;
    }
    ue.reset();
    const c = Ct.factory(o.segments);
    return new Ft(c).getGeom();
  }
}, xe = new kt(), Ve = xe, Bt = 0, Te = class Ae {
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
  static compare(e, n) {
    const r = e.leftSE.point.x, i = n.leftSE.point.x, o = e.rightSE.point.x, u = n.rightSE.point.x;
    if (u.isLessThan(r)) return 1;
    if (o.isLessThan(i)) return -1;
    const c = e.leftSE.point.y, m = n.leftSE.point.y, f = e.rightSE.point.y, v = n.rightSE.point.y;
    if (r.isLessThan(i)) {
      if (m.isLessThan(c) && m.isLessThan(f)) return 1;
      if (m.isGreaterThan(c) && m.isGreaterThan(f)) return -1;
      const S = e.comparePoint(n.leftSE.point);
      if (S < 0) return 1;
      if (S > 0) return -1;
      const L = n.comparePoint(e.rightSE.point);
      return L !== 0 ? L : -1;
    }
    if (r.isGreaterThan(i)) {
      if (c.isLessThan(m) && c.isLessThan(v)) return -1;
      if (c.isGreaterThan(m) && c.isGreaterThan(v)) return 1;
      const S = n.comparePoint(e.leftSE.point);
      if (S !== 0) return S;
      const L = e.comparePoint(n.rightSE.point);
      return L < 0 ? 1 : L > 0 ? -1 : 1;
    }
    if (c.isLessThan(m)) return -1;
    if (c.isGreaterThan(m)) return 1;
    if (o.isLessThan(u)) {
      const S = n.comparePoint(e.rightSE.point);
      if (S !== 0) return S;
    }
    if (o.isGreaterThan(u)) {
      const S = e.comparePoint(n.rightSE.point);
      if (S < 0) return 1;
      if (S > 0) return -1;
    }
    if (!o.eq(u)) {
      const S = f.minus(c), L = o.minus(r), P = v.minus(m), N = u.minus(i);
      if (S.isGreaterThan(L) && P.isLessThan(N)) return 1;
      if (S.isLessThan(L) && P.isGreaterThan(N)) return -1;
    }
    return o.isGreaterThan(u) ? 1 : o.isLessThan(u) || f.isLessThan(v) ? -1 : f.isGreaterThan(v) ? 1 : e.id < n.id ? -1 : e.id > n.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, n, r, i) {
    this.id = ++Bt, this.leftSE = e, e.segment = this, e.otherSE = n, this.rightSE = n, n.segment = this, n.otherSE = e, this.rings = r, this.windings = i;
  }
  static fromRing(e, n, r) {
    let i, o, u;
    const c = se.comparePoints(e, n);
    if (c < 0)
      i = e, o = n, u = 1;
    else if (c > 0)
      i = n, o = e, u = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const m = new se(i, !0), f = new se(o, !1);
    return new Ae(m, f, [r], [u]);
  }
  /* When a segment is split, the rightSE is replaced with a new sweep event */
  replaceRightSE(e) {
    this.rightSE = e, this.rightSE.segment = this, this.rightSE.otherSE = this.leftSE, this.leftSE.otherSE = this.rightSE;
  }
  bbox() {
    const e = this.leftSE.point.y, n = this.rightSE.point.y;
    return {
      ll: { x: this.leftSE.point.x, y: e.isLessThan(n) ? e : n },
      ur: { x: this.rightSE.point.x, y: e.isGreaterThan(n) ? e : n }
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
    return ue.orient(this.leftSE.point, e, this.rightSE.point);
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
    const n = this.bbox(), r = e.bbox(), i = ze(n, r);
    if (i === null) return null;
    const o = this.leftSE.point, u = this.rightSE.point, c = e.leftSE.point, m = e.rightSE.point, f = de(n, c) && this.comparePoint(c) === 0, v = de(r, o) && e.comparePoint(o) === 0, S = de(n, m) && this.comparePoint(m) === 0, L = de(r, u) && e.comparePoint(u) === 0;
    if (v && f)
      return L && !S ? u : !L && S ? m : null;
    if (v)
      return S && o.x.eq(m.x) && o.y.eq(m.y) ? null : o;
    if (f)
      return L && u.x.eq(c.x) && u.y.eq(c.y) ? null : c;
    if (L && S) return null;
    if (L) return u;
    if (S) return m;
    const P = Rt(o, this.vector(), c, e.vector());
    return P === null || !de(i, P) ? null : ue.snap(P);
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
    const n = [], r = e.events !== void 0, i = new se(e, !0), o = new se(e, !1), u = this.rightSE;
    this.replaceRightSE(o), n.push(o), n.push(i);
    const c = new Ae(
      i,
      u,
      this.rings.slice(),
      this.windings.slice()
    );
    return se.comparePoints(c.leftSE.point, c.rightSE.point) > 0 && c.swapEvents(), se.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), r && (i.checkForConsuming(), o.checkForConsuming()), n;
  }
  /* Swap which event is left and right */
  swapEvents() {
    const e = this.rightSE;
    this.rightSE = this.leftSE, this.leftSE = e, this.leftSE.isLeft = !0, this.rightSE.isLeft = !1;
    for (let n = 0, r = this.windings.length; n < r; n++)
      this.windings[n] *= -1;
  }
  /* Consume another segment. We take their rings under our wing
   * and mark them as consumed. Use for perfectly overlapping segments */
  consume(e) {
    let n = this, r = e;
    for (; n.consumedBy; ) n = n.consumedBy;
    for (; r.consumedBy; ) r = r.consumedBy;
    const i = Ae.compare(n, r);
    if (i !== 0) {
      if (i > 0) {
        const o = n;
        n = r, r = o;
      }
      if (n.prev === r) {
        const o = n;
        n = r, r = o;
      }
      for (let o = 0, u = r.rings.length; o < u; o++) {
        const c = r.rings[o], m = r.windings[o], f = n.rings.indexOf(c);
        f === -1 ? (n.rings.push(c), n.windings.push(m)) : n.windings[f] += m;
      }
      r.rings = null, r.windings = null, r.consumedBy = n, r.leftSE.consumedBy = n.leftSE, r.rightSE.consumedBy = n.rightSE;
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
    const n = this._afterState.rings, r = this._afterState.windings, i = this._afterState.multiPolys;
    for (let c = 0, m = this.rings.length; c < m; c++) {
      const f = this.rings[c], v = this.windings[c], S = n.indexOf(f);
      S === -1 ? (n.push(f), r.push(v)) : r[S] += v;
    }
    const o = [], u = [];
    for (let c = 0, m = n.length; c < m; c++) {
      if (r[c] === 0) continue;
      const f = n[c], v = f.poly;
      if (u.indexOf(v) === -1)
        if (f.isExterior) o.push(v);
        else {
          u.indexOf(v) === -1 && u.push(v);
          const S = o.indexOf(f.poly);
          S !== -1 && o.splice(S, 1);
        }
    }
    for (let c = 0, m = o.length; c < m; c++) {
      const f = o[c].multiPoly;
      i.indexOf(f) === -1 && i.push(f);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const e = this.beforeState().multiPolys, n = this.afterState().multiPolys;
    switch (Ve.type) {
      case "union": {
        const r = e.length === 0, i = n.length === 0;
        this._isInResult = r !== i;
        break;
      }
      case "intersection": {
        let r, i;
        e.length < n.length ? (r = e.length, i = n.length) : (r = n.length, i = e.length), this._isInResult = i === Ve.numMultiPolys && r < i;
        break;
      }
      case "xor": {
        const r = Math.abs(e.length - n.length);
        this._isInResult = r % 2 === 1;
        break;
      }
      case "difference": {
        const r = (i) => i.length === 1 && i[0].isSubject;
        this._isInResult = r(e) !== r(n);
        break;
      }
    }
    return this._isInResult;
  }
}, Qe = class {
  poly;
  isExterior;
  segments;
  bbox;
  constructor(t, e, n) {
    if (!Array.isArray(t) || t.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (this.poly = e, this.isExterior = n, this.segments = [], typeof t[0][0] != "number" || typeof t[0][1] != "number")
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const r = ue.snap({ x: new oe(t[0][0]), y: new oe(t[0][1]) });
    this.bbox = {
      ll: { x: r.x, y: r.y },
      ur: { x: r.x, y: r.y }
    };
    let i = r;
    for (let o = 1, u = t.length; o < u; o++) {
      if (typeof t[o][0] != "number" || typeof t[o][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const c = ue.snap({ x: new oe(t[o][0]), y: new oe(t[o][1]) });
      c.x.eq(i.x) && c.y.eq(i.y) || (this.segments.push(Te.fromRing(i, c, this)), c.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = c.x), c.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = c.y), c.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = c.x), c.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = c.y), i = c);
    }
    (!r.x.eq(i.x) || !r.y.eq(i.y)) && this.segments.push(Te.fromRing(i, r, this));
  }
  getSweepEvents() {
    const t = [];
    for (let e = 0, n = this.segments.length; e < n; e++) {
      const r = this.segments[e];
      t.push(r.leftSE), t.push(r.rightSE);
    }
    return t;
  }
}, Gt = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(t, e) {
    if (!Array.isArray(t))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new Qe(t[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let n = 1, r = t.length; n < r; n++) {
      const i = new Qe(t[n], this, !1);
      i.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = i.bbox.ll.x), i.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = i.bbox.ll.y), i.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = i.bbox.ur.x), i.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = i.bbox.ur.y), this.interiorRings.push(i);
    }
    this.multiPoly = e;
  }
  getSweepEvents() {
    const t = this.exteriorRing.getSweepEvents();
    for (let e = 0, n = this.interiorRings.length; e < n; e++) {
      const r = this.interiorRings[e].getSweepEvents();
      for (let i = 0, o = r.length; i < o; i++)
        t.push(r[i]);
    }
    return t;
  }
}, je = class {
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
      ll: { x: new oe(Number.POSITIVE_INFINITY), y: new oe(Number.POSITIVE_INFINITY) },
      ur: { x: new oe(Number.NEGATIVE_INFINITY), y: new oe(Number.NEGATIVE_INFINITY) }
    };
    for (let n = 0, r = t.length; n < r; n++) {
      const i = new Gt(t[n], this);
      i.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = i.bbox.ll.x), i.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = i.bbox.ll.y), i.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = i.bbox.ur.x), i.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = i.bbox.ur.y), this.polys.push(i);
    }
    this.isSubject = e;
  }
  getSweepEvents() {
    const t = [];
    for (let e = 0, n = this.polys.length; e < n; e++) {
      const r = this.polys[e].getSweepEvents();
      for (let i = 0, o = r.length; i < o; i++)
        t.push(r[i]);
    }
    return t;
  }
}, qt = (t, ...e) => Ve.run("union", t, e);
ue.set;
function he(t, e, n = {}) {
  const r = { type: "Feature" };
  return (n.id === 0 || n.id) && (r.id = n.id), n.bbox && (r.bbox = n.bbox), r.properties = e || {}, r.geometry = t, r;
}
function Dt(t, e, n = {}) {
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
  return he({
    type: "Polygon",
    coordinates: t
  }, e, n);
}
function et(t, e, n = {}) {
  if (t.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return he({
    type: "LineString",
    coordinates: t
  }, e, n);
}
function dt(t, e = {}) {
  const n = { type: "FeatureCollection" };
  return e.id && (n.id = e.id), e.bbox && (n.bbox = e.bbox), n.features = t, n;
}
function Ut(t, e, n = {}) {
  return he({
    type: "MultiPolygon",
    coordinates: t
  }, e, n);
}
function zt(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function $t(t, e) {
  if (t.type === "Feature")
    e(t, 0);
  else if (t.type === "FeatureCollection")
    for (var n = 0; n < t.features.length && e(t.features[n], n) !== !1; n++)
      ;
}
function Xe(t, e) {
  var n, r, i, o, u, c, m, f, v, S, L = 0, P = t.type === "FeatureCollection", N = t.type === "Feature", A = P ? t.features.length : 1;
  for (n = 0; n < A; n++) {
    for (c = P ? (
      // @ts-expect-error: Known type conflict
      t.features[n].geometry
    ) : N ? (
      // @ts-expect-error: Known type conflict
      t.geometry
    ) : t, f = P ? (
      // @ts-expect-error: Known type conflict
      t.features[n].properties
    ) : N ? (
      // @ts-expect-error: Known type conflict
      t.properties
    ) : {}, v = P ? (
      // @ts-expect-error: Known type conflict
      t.features[n].bbox
    ) : N ? (
      // @ts-expect-error: Known type conflict
      t.bbox
    ) : void 0, S = P ? (
      // @ts-expect-error: Known type conflict
      t.features[n].id
    ) : N ? (
      // @ts-expect-error: Known type conflict
      t.id
    ) : void 0, m = c ? c.type === "GeometryCollection" : !1, u = m ? c.geometries.length : 1, i = 0; i < u; i++) {
      if (o = m ? c.geometries[i] : c, o === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            L,
            f,
            v,
            S
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
              L,
              f,
              v,
              S
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (r = 0; r < o.geometries.length; r++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                o.geometries[r],
                L,
                f,
                v,
                S
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    L++;
  }
}
function Vt(t, e) {
  Xe(t, function(n, r, i, o, u) {
    var c = n === null ? null : n.type;
    switch (c) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            he(n, i, { bbox: o, id: u }),
            r,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var m;
    switch (c) {
      case "MultiPoint":
        m = "Point";
        break;
      case "MultiLineString":
        m = "LineString";
        break;
      case "MultiPolygon":
        m = "Polygon";
        break;
    }
    for (
      var f = 0;
      // @ts-expect-error: Known type conflict
      f < n.coordinates.length;
      f++
    ) {
      var v = n.coordinates[f], S = {
        type: m,
        coordinates: v
      };
      if (
        // @ts-expect-error: Known type conflict
        e(he(S, i), r, f) === !1
      )
        return !1;
    }
  });
}
function Ht(t, e = {}) {
  const n = [];
  if (Xe(t, (i) => {
    n.push(i.coordinates);
  }), n.length < 2)
    throw new Error("Must have at least 2 geometries");
  const r = qt(n[0], ...n.slice(1));
  return r.length === 0 ? null : r.length === 1 ? Dt(r[0], e.properties) : Ut(r, e.properties);
}
function Xt(t) {
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
  return $t(t, (n) => {
    var r;
    switch ((r = n.geometry) == null ? void 0 : r.type) {
      case "Point":
        e.MultiPoint.coordinates.push(n.geometry.coordinates), e.MultiPoint.properties.push(n.properties);
        break;
      case "MultiPoint":
        e.MultiPoint.coordinates.push(...n.geometry.coordinates), e.MultiPoint.properties.push(n.properties);
        break;
      case "LineString":
        e.MultiLineString.coordinates.push(n.geometry.coordinates), e.MultiLineString.properties.push(n.properties);
        break;
      case "MultiLineString":
        e.MultiLineString.coordinates.push(
          ...n.geometry.coordinates
        ), e.MultiLineString.properties.push(n.properties);
        break;
      case "Polygon":
        e.MultiPolygon.coordinates.push(n.geometry.coordinates), e.MultiPolygon.properties.push(n.properties);
        break;
      case "MultiPolygon":
        e.MultiPolygon.coordinates.push(...n.geometry.coordinates), e.MultiPolygon.properties.push(n.properties);
        break;
    }
  }), dt(
    Object.keys(e).filter(function(n) {
      return e[n].coordinates.length;
    }).sort().map(function(n) {
      var r = { type: n, coordinates: e[n].coordinates }, i = { collectedProperties: e[n].properties };
      return he(r, i);
    })
  );
}
function Yt(t) {
  if (!t) throw new Error("geojson is required");
  var e = [];
  return Vt(t, function(n) {
    e.push(n);
  }), dt(e);
}
class Kt {
  constructor(e = [], n = (r, i) => r < i ? -1 : r > i ? 1 : 0) {
    if (this.data = e, this.length = this.data.length, this.compare = n, this.length > 0)
      for (let r = (this.length >> 1) - 1; r >= 0; r--) this._down(r);
  }
  push(e) {
    this.data.push(e), this._up(this.length++);
  }
  pop() {
    if (this.length === 0) return;
    const e = this.data[0], n = this.data.pop();
    return --this.length > 0 && (this.data[0] = n, this._down(0)), e;
  }
  peek() {
    return this.data[0];
  }
  _up(e) {
    const { data: n, compare: r } = this, i = n[e];
    for (; e > 0; ) {
      const o = e - 1 >> 1, u = n[o];
      if (r(i, u) >= 0) break;
      n[e] = u, e = o;
    }
    n[e] = i;
  }
  _down(e) {
    const { data: n, compare: r } = this, i = this.length >> 1, o = n[e];
    for (; e < i; ) {
      let u = (e << 1) + 1;
      const c = u + 1;
      if (c < this.length && r(n[c], n[u]) < 0 && (u = c), r(n[u], o) >= 0) break;
      n[e] = n[u], e = u;
    }
    n[e] = o;
  }
}
function Jt(t, e = 1, n = !1) {
  let r = 1 / 0, i = 1 / 0, o = -1 / 0, u = -1 / 0;
  for (const [O, x] of t[0])
    O < r && (r = O), x < i && (i = x), O > o && (o = O), x > u && (u = x);
  const c = o - r, m = u - i, f = Math.max(e, Math.min(c, m));
  if (f === e) {
    const O = [r, i];
    return O.distance = 0, O;
  }
  const v = new Kt([], (O, x) => x.max - O.max);
  let S = Wt(t);
  const L = new Oe(r + c / 2, i + m / 2, 0, t);
  L.d > S.d && (S = L);
  let P = 2;
  function N(O, x, T) {
    const k = new Oe(O, x, T, t);
    P++, k.max > S.d + e && v.push(k), k.d > S.d && (S = k, n && console.log(\`found best \${Math.round(1e4 * k.d) / 1e4} after \${P} probes\`));
  }
  let A = f / 2;
  for (let O = r; O < o; O += f)
    for (let x = i; x < u; x += f)
      N(O + A, x + A, A);
  for (; v.length; ) {
    const { max: O, x, y: T, h: k } = v.pop();
    if (O - S.d <= e) break;
    A = k / 2, N(x - A, T - A, A), N(x + A, T - A, A), N(x - A, T + A, A), N(x + A, T + A, A);
  }
  n && console.log(\`num probes: \${P}
best distance: \${S.d}\`);
  const B = [S.x, S.y];
  return B.distance = S.d, B;
}
function Oe(t, e, n, r) {
  this.x = t, this.y = e, this.h = n, this.d = Zt(t, e, r), this.max = this.d + this.h * Math.SQRT2;
}
function Zt(t, e, n) {
  let r = !1, i = 1 / 0;
  for (const o of n)
    for (let u = 0, c = o.length, m = c - 1; u < c; m = u++) {
      const f = o[u], v = o[m];
      f[1] > e != v[1] > e && t < (v[0] - f[0]) * (e - f[1]) / (v[1] - f[1]) + f[0] && (r = !r), i = Math.min(i, Qt(t, e, f, v));
    }
  return i === 0 ? 0 : (r ? 1 : -1) * Math.sqrt(i);
}
function Wt(t) {
  let e = 0, n = 0, r = 0;
  const i = t[0];
  for (let u = 0, c = i.length, m = c - 1; u < c; m = u++) {
    const f = i[u], v = i[m], S = f[0] * v[1] - v[0] * f[1];
    n += (f[0] + v[0]) * S, r += (f[1] + v[1]) * S, e += S * 3;
  }
  const o = new Oe(n / e, r / e, 0, t);
  return e === 0 || o.d < 0 ? new Oe(i[0][0], i[0][1], 0, t) : o;
}
function Qt(t, e, n, r) {
  let i = n[0], o = n[1], u = r[0] - i, c = r[1] - o;
  if (u !== 0 || c !== 0) {
    const m = ((t - i) * u + (e - o) * c) / (u * u + c * c);
    m > 1 ? (i = r[0], o = r[1]) : m > 0 && (i += u * m, o += c * m);
  }
  return u = t - i, c = e - o, u * u + c * c;
}
function jt(t) {
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
function we(t) {
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
function en(t, e) {
  return t.type === "FeatureCollection" ? "FeatureCollection" : t.type === "GeometryCollection" ? "GeometryCollection" : t.type === "Feature" && t.geometry !== null ? t.geometry.type : t.type;
}
function tt(t, e, n = {}) {
  const r = jt(t), i = we(e);
  for (let o = 0; o < i.length - 1; o++) {
    let u = !1;
    if (n.ignoreEndVertices && (o === 0 && (u = "start"), o === i.length - 2 && (u = "end"), o === 0 && o + 1 === i.length - 1 && (u = "both")), tn(
      i[o],
      i[o + 1],
      r,
      u,
      typeof n.epsilon > "u" ? null : n.epsilon
    ))
      return !0;
  }
  return !1;
}
function tn(t, e, n, r, i) {
  const o = n[0], u = n[1], c = t[0], m = t[1], f = e[0], v = e[1], S = n[0] - c, L = n[1] - m, P = f - c, N = v - m, A = S * N - L * P;
  if (i !== null) {
    if (Math.abs(A) > i)
      return !1;
  } else if (A !== 0)
    return !1;
  if (Math.abs(P) === Math.abs(N) && Math.abs(P) === 0)
    return r ? !1 : n[0] === t[0] && n[1] === t[1];
  if (r) {
    if (r === "start")
      return Math.abs(P) >= Math.abs(N) ? P > 0 ? c < o && o <= f : f <= o && o < c : N > 0 ? m < u && u <= v : v <= u && u < m;
    if (r === "end")
      return Math.abs(P) >= Math.abs(N) ? P > 0 ? c <= o && o < f : f < o && o <= c : N > 0 ? m <= u && u < v : v < u && u <= m;
    if (r === "both")
      return Math.abs(P) >= Math.abs(N) ? P > 0 ? c < o && o < f : f < o && o < c : N > 0 ? m < u && u < v : v < u && u < m;
  } else return Math.abs(P) >= Math.abs(N) ? P > 0 ? c <= o && o <= f : f <= o && o <= c : N > 0 ? m <= u && u <= v : v <= u && u <= m;
  return !1;
}
function nn(t, e = {}) {
  var n = typeof e == "object" ? e.mutate : e;
  if (!t) throw new Error("geojson is required");
  var r = en(t), i = [];
  switch (r) {
    case "LineString":
      i = Ge(t, r);
      break;
    case "MultiLineString":
    case "Polygon":
      we(t).forEach(function(u) {
        i.push(Ge(u, r));
      });
      break;
    case "MultiPolygon":
      we(t).forEach(function(u) {
        var c = [];
        u.forEach(function(m) {
          c.push(Ge(m, r));
        }), i.push(c);
      });
      break;
    case "Point":
      return t;
    case "MultiPoint":
      var o = {};
      we(t).forEach(function(u) {
        var c = u.join("-");
        Object.prototype.hasOwnProperty.call(o, c) || (i.push(u), o[c] = !0);
      });
      break;
    default:
      throw new Error(r + " geometry not supported");
  }
  return t.coordinates ? n === !0 ? (t.coordinates = i, t) : { type: r, coordinates: i } : n === !0 ? (t.geometry.coordinates = i, t) : he({ type: r, coordinates: i }, t.properties, {
    bbox: t.bbox,
    id: t.id
  });
}
function Ge(t, e) {
  const n = we(t);
  if (n.length === 2 && !nt(n[0], n[1])) return n;
  const r = [];
  let i = 0, o = 1, u = 2;
  for (r.push(n[i]); u < n.length; )
    tt(n[o], et([n[i], n[u]])) ? o = u : (r.push(n[o]), i = o, o++, u = o), u++;
  if (r.push(n[o]), e === "Polygon" || e === "MultiPolygon") {
    if (tt(
      r[0],
      et([r[1], r[r.length - 2]])
    ) && (r.shift(), r.pop(), r.push(r[0])), r.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!nt(r[0], r[r.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return r;
}
function nt(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}
function rn(t) {
  if (!t)
    throw new Error("geojson is required");
  switch (t.type) {
    case "Feature":
      return mt(t);
    case "FeatureCollection":
      return sn(t);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return Ye(t);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function mt(t) {
  const e = { type: "Feature" };
  return Object.keys(t).forEach((n) => {
    switch (n) {
      case "type":
      case "properties":
      case "geometry":
        return;
      default:
        e[n] = t[n];
    }
  }), e.properties = xt(t.properties), t.geometry == null ? e.geometry = null : e.geometry = Ye(t.geometry), e;
}
function xt(t) {
  const e = {};
  return t && Object.keys(t).forEach((n) => {
    const r = t[n];
    typeof r == "object" ? r === null ? e[n] = null : Array.isArray(r) ? e[n] = r.map((i) => i) : e[n] = xt(r) : e[n] = r;
  }), e;
}
function sn(t) {
  const e = { type: "FeatureCollection" };
  return Object.keys(t).forEach((n) => {
    switch (n) {
      case "type":
      case "features":
        return;
      default:
        e[n] = t[n];
    }
  }), e.features = t.features.map((n) => mt(n)), e;
}
function Ye(t) {
  const e = { type: t.type };
  return t.bbox && (e.bbox = t.bbox), t.type === "GeometryCollection" ? (e.geometries = t.geometries.map((n) => Ye(n)), e) : (e.coordinates = wt(t.coordinates), e);
}
function wt(t) {
  const e = t;
  return typeof e[0] != "object" ? e.slice() : e.map((n) => wt(n));
}
function on(t, e) {
  var n = t[0] - e[0], r = t[1] - e[1];
  return n * n + r * r;
}
function ln(t, e, n) {
  var r = e[0], i = e[1], o = n[0] - r, u = n[1] - i;
  if (o !== 0 || u !== 0) {
    var c = ((t[0] - r) * o + (t[1] - i) * u) / (o * o + u * u);
    c > 1 ? (r = n[0], i = n[1]) : c > 0 && (r += o * c, i += u * c);
  }
  return o = t[0] - r, u = t[1] - i, o * o + u * u;
}
function un(t, e) {
  for (var n = t[0], r = [n], i, o = 1, u = t.length; o < u; o++)
    i = t[o], on(i, n) > e && (r.push(i), n = i);
  return n !== i && r.push(i), r;
}
function He(t, e, n, r, i) {
  for (var o = r, u, c = e + 1; c < n; c++) {
    var m = ln(t[c], t[e], t[n]);
    m > o && (u = c, o = m);
  }
  o > r && (u - e > 1 && He(t, e, u, r, i), i.push(t[u]), n - u > 1 && He(t, u, n, r, i));
}
function fn(t, e) {
  var n = t.length - 1, r = [t[0]];
  return He(t, 0, n, e, r), r.push(t[n]), r;
}
function _e(t, e, n) {
  if (t.length <= 2) return t;
  var r = e !== void 0 ? e * e : 1;
  return t = n ? t : un(t, r), t = fn(t, r), t;
}
function rt(t, e = {}) {
  var n, r, i;
  if (e = e ?? {}, !zt(e)) throw new Error("options is invalid");
  const o = (n = e.tolerance) != null ? n : 1, u = (r = e.highQuality) != null ? r : !1, c = (i = e.mutate) != null ? i : !1;
  if (!t) throw new Error("geojson is required");
  if (o && o < 0) throw new Error("invalid tolerance");
  return c !== !0 && (t = rn(t)), Xe(t, function(m) {
    an(m, o, u);
  }), t;
}
function an(t, e, n) {
  const r = t.type;
  if (r === "Point" || r === "MultiPoint") return t;
  if (nn(t, { mutate: !0 }), r !== "GeometryCollection")
    switch (r) {
      case "LineString":
        t.coordinates = _e(
          t.coordinates,
          e,
          n
        );
        break;
      case "MultiLineString":
        t.coordinates = t.coordinates.map(
          (i) => _e(i, e, n)
        );
        break;
      case "Polygon":
        t.coordinates = it(
          t.coordinates,
          e,
          n
        );
        break;
      case "MultiPolygon":
        t.coordinates = t.coordinates.map(
          (i) => it(i, e, n)
        );
    }
  return t;
}
function it(t, e, n) {
  return t.map(function(r) {
    if (r.length < 4)
      throw new Error("invalid polygon");
    let i = e, o = _e(r, i, n);
    for (; !st(o) && i >= Number.EPSILON; )
      i -= i * 0.01, o = _e(r, i, n);
    return st(o) ? ((o[o.length - 1][0] !== o[0][0] || o[o.length - 1][1] !== o[0][1]) && o.push(o[0]), o) : r;
  });
}
function st(t) {
  return t.length < 3 ? !1 : !(t.length === 3 && t[2][0] === t[0][0] && t[2][1] === t[0][1]);
}
class Re {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  static _nextPow2(e) {
    return e <= 0 ? 0 : (e = e - 1 >>> 0, e |= e >> 1, e |= e >> 2, e |= e >> 4, e |= e >> 8, e |= e >> 16, e + 1 >>> 0);
  }
  rent(e) {
    const n = Re._nextPow2(e || 1), r = this.map.get(n);
    return r && r.length ? r.pop() : new ArrayBuffer(n);
  }
  release(e) {
    if (!e || !e.byteLength) return;
    const n = Re._nextPow2(e.byteLength);
    let r = this.map.get(n);
    r || (r = [], this.map.set(n, r)), r.push(e);
  }
}
let ie = !1;
function ot(t, e = {}) {
  const n = [], r = [], i = [], o = new TextEncoder(), u = [], c = /* @__PURE__ */ new Map();
  let m = 0, f = 0;
  const v = (A) => {
    if (Array.isArray(A)) {
      const B = Number(A[0]), O = Number(A[1]);
      r.push(Number.isFinite(B) ? B : 0, Number.isFinite(O) ? O : 0);
    } else if (A && (typeof A.x == "number" || typeof A.y == "number")) {
      const B = Number(A.x), O = Number(A.y);
      r.push(Number.isFinite(B) ? B : 0, Number.isFinite(O) ? O : 0);
    } else
      r.push(0, 0);
  };
  for (const A of t) {
    const B = A.id == null ? "" : String(A.id), O = A.geometry || {}, x = O.type || "Unknown", T = { id: B, type: x, coordsOffset: m, coordsLength: 0 };
    if (x === "Point") {
      const C = O.coordinates || [];
      v(C), T.coordsLength = 2;
    } else if (x === "LineString" || x === "MultiPoint") {
      const C = O.coordinates || [];
      for (const F of C) v(F);
      T.coordsLength = (C.length || 0) * 2;
    } else if (x === "Polygon") {
      const C = O.coordinates || [];
      T.ringLengths = [];
      for (const F of C) {
        T.ringLengths.push(F.length || 0);
        for (const s of F) v(s);
      }
      T.coordsLength = T.ringLengths.reduce((F, s) => F + s, 0) * 2;
    } else if (x === "MultiPolygon") {
      const C = O.coordinates || [];
      T.polygonRingCounts = [], T.ringLengths = [];
      for (const F of C) {
        T.polygonRingCounts.push(F.length || 0);
        for (const s of F) {
          T.ringLengths.push(s.length || 0);
          for (const l of s) v(l);
        }
      }
      T.coordsLength = T.ringLengths.reduce((F, s) => F + s, 0) * 2;
    } else
      T.coordsLength = 0;
    const k = A.properties || {}, D = [];
    for (const C of Object.keys(k)) {
      let F = c.get(C);
      F === void 0 && (F = u.length, u.push(C), c.set(C, F));
      const s = JSON.stringify(k[C]), l = o.encode(s);
      i.push(l), D.push([F, f, l.length]), f += l.length;
    }
    T.props = D, m += T.coordsLength, n.push(T);
  }
  let S;
  if (e.propsBuffer)
    e.propsBuffer instanceof Uint8Array ? S = e.propsBuffer.subarray(0, f) : S = new Uint8Array(e.propsBuffer, 0, f), S.byteLength < f && (S = new Uint8Array(f));
  else if (e.pool) {
    const A = e.pool.rent(f || 1);
    S = new Uint8Array(A, 0, f);
  } else
    S = new Uint8Array(f);
  let L = 0;
  for (const A of i)
    S.set(A, L), L += A.length;
  const P = r.length;
  let N;
  if (e.coordsBuffer)
    e.coordsBuffer instanceof ArrayBuffer ? N = new Float32Array(e.coordsBuffer, 0, P) : e.coordsBuffer instanceof Float32Array ? N = e.coordsBuffer.subarray(0, P) : N = new Float32Array(P), N.length < P && (N = new Float32Array(P));
  else if (e.pool) {
    const A = e.pool.rent(P * 4 || 4);
    N = new Float32Array(A, 0, P);
  } else
    N = new Float32Array(P);
  return N.length > 0 && N.set(r), { meta: n, keys: u, propsBuffer: S, coordsArray: N };
}
function cn(t, e, n, r) {
  const i = n instanceof Float32Array ? n : new Float32Array(n), o = e instanceof Uint8Array ? e : e ? new Uint8Array(e) : new Uint8Array(0), u = new TextDecoder(), c = [];
  for (let m = 0; m < (t.length || 0); m++) {
    const f = t[m] || {}, v = f.id, S = {};
    if (Array.isArray(f.props) && f.props.length && r && r.length)
      for (const O of f.props) {
        const [x, T, k] = O;
        try {
          const D = o.subarray(T, T + k);
          S[r[x]] = JSON.parse(u.decode(D));
        } catch {
        }
      }
    const L = f.type || "Unknown";
    let P = f.coordsOffset || 0;
    const N = P + (f.coordsLength || 0);
    let A = null;
    if (L === "Point") {
      const O = i[P], x = i[P + 1], T = Number.isFinite(O) ? Math.max(-180, Math.min(180, O)) : 0, k = Number.isFinite(x) ? Math.max(-90, Math.min(90, x)) : 0;
      if ((!Number.isFinite(O) || !Number.isFinite(x)) && !ie) {
        ie = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value", { index: m, id: v, rawX: O, rawY: x });
        } catch {
        }
      }
      A = { type: "Point", coordinates: [T, k] };
    } else if (L === "LineString" || L === "MultiPoint") {
      const O = [];
      for (; P < N; P += 2) {
        const x = i[P], T = i[P + 1], k = Number.isFinite(x) ? Math.max(-180, Math.min(180, x)) : 0, D = Number.isFinite(T) ? Math.max(-90, Math.min(90, T)) : 0;
        if ((!Number.isFinite(x) || !Number.isFinite(T)) && !ie) {
          ie = !0;
          try {
            console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value", { index: m, id: v, rawX: x, rawY: T });
          } catch {
          }
        }
        O.push([k, D]);
      }
      A = { type: L, coordinates: O };
    } else if (L === "Polygon") {
      const O = [], x = f.ringLengths || [];
      for (const T of x) {
        const k = [];
        for (let D = 0; D < T; D++) {
          const C = i[P], F = i[P + 1], s = Number.isFinite(C) ? Math.max(-180, Math.min(180, C)) : 0, l = Number.isFinite(F) ? Math.max(-90, Math.min(90, F)) : 0;
          if ((!Number.isFinite(C) || !Number.isFinite(F)) && !ie) {
            ie = !0;
            try {
              console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value", { index: m, id: v, rawX: C, rawY: F });
            } catch {
            }
          }
          k.push([s, l]), P += 2;
        }
        O.push(k);
      }
      A = { type: "Polygon", coordinates: O };
    } else if (L === "MultiPolygon") {
      const O = [], x = f.polygonRingCounts || [], T = f.ringLengths || [];
      let k = 0;
      for (const D of x) {
        const C = [];
        for (let F = 0; F < D; F++) {
          const s = T[k++] || 0, l = [];
          for (let a = 0; a < s; a++) {
            const d = i[P], p = i[P + 1], y = Number.isFinite(d) ? Math.max(-180, Math.min(180, d)) : 0, E = Number.isFinite(p) ? Math.max(-90, Math.min(90, p)) : 0;
            if ((!Number.isFinite(d) || !Number.isFinite(p)) && !ie) {
              ie = !0;
              try {
                console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value", { index: m, id: v, rawX: d, rawY: p });
              } catch {
              }
            }
            l.push([y, E]), P += 2;
          }
          C.push(l);
        }
        O.push(C);
      }
      A = { type: "MultiPolygon", coordinates: O };
    } else if (P < N) {
      const O = i[P], x = i[P + 1], T = Number.isFinite(O) ? Math.max(-180, Math.min(180, O)) : 0, k = Number.isFinite(x) ? Math.max(-90, Math.min(90, x)) : 0;
      if ((!Number.isFinite(O) || !Number.isFinite(x)) && !ie) {
        ie = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value", { index: m, id: v, rawX: O, rawY: x });
        } catch {
        }
      }
      A = { type: "Point", coordinates: [T, k] };
    }
    A == null && (A = { type: "Point", coordinates: [0, 0] });
    const B = S && typeof S == "object" ? S : {};
    c.push({ type: "Feature", id: v, geometry: A, properties: B });
  }
  return c;
}
const lt = new Re(), z = /* @__PURE__ */ new Map();
let Se = 1e4, pe = null;
function ut(t) {
  return typeof t == "number" && isFinite(t);
}
function ft(t) {
  if (!Array.isArray(t) || t.length < 2) return !1;
  const e = Number(t[0]), n = Number(t[1]);
  return !ut(e) || !ut(n) ? !1 : Math.abs(n) <= 90 && Math.abs(e) <= 180;
}
function bt(t) {
  if (!Array.isArray(t)) return [0, 0];
  if (t.length === 0) return t;
  if (typeof t[0] == "number") {
    const e = Number(t[0]), n = Number(t[1]);
    return ft([e, n]) ? [e, n] : ft([n, e]) ? [n, e] : [0, 0];
  }
  return t.map(bt);
}
function hn(t) {
  if (!t || !t.type) return { type: "Point", coordinates: [0, 0] };
  try {
    const e = t.type;
    return t.coordinates = bt(t.coordinates), e === "Point" && (!Array.isArray(t.coordinates) || t.coordinates.length < 2) && (t.coordinates = [0, 0]), { type: e, coordinates: t.coordinates };
  } catch {
    return { type: "Point", coordinates: [0, 0] };
  }
}
function pn(t) {
  let e = 0;
  for (let n = 0; n < t.length; n++) {
    const r = (n + 1) % t.length, i = Number(t[n] && t[n][0]) || 0, o = Number(t[n] && t[n][1]) || 0, u = Number(t[r] && t[r][0]) || 0, c = Number(t[r] && t[r][1]) || 0;
    e += i * c - u * o;
  }
  return e / 2;
}
function Et(t) {
  let e = 0, n = 0, r = 0;
  for (let c = 0; c < t.length; c++) {
    const m = (c + 1) % t.length, f = Number(t[c] && t[c][0]) || 0, v = Number(t[c] && t[c][1]) || 0, S = Number(t[m] && t[m][0]) || 0, L = Number(t[m] && t[m][1]) || 0, P = f * L - S * v;
    e += (f + S) * P, n += (v + L) * P, r += P;
  }
  const i = r / 2;
  if (!Number.isFinite(i) || Math.abs(i) < 1e-12) {
    let c = 0, m = 0, f = 0;
    for (const v of t) {
      const S = Number(v && v[0]), L = Number(v && v[1]);
      Number.isFinite(S) && Number.isFinite(L) && (c += S, m += L, f++);
    }
    return f ? [c / f, m / f] : [0, 0];
  }
  const o = e / (6 * i), u = n / (6 * i);
  return [o, u];
}
function gn(t) {
  if (!Array.isArray(t) || t.length === 0) return null;
  const e = t[0];
  return !Array.isArray(e) || e.length === 0 ? null : Et(e);
}
function yn(t) {
  if (!Array.isArray(t) || t.length === 0) return null;
  let e = null, n = 0;
  for (const r of t) {
    if (!Array.isArray(r) || !Array.isArray(r[0])) continue;
    const i = Math.abs(pn(r[0]));
    i > n && (n = i, e = r[0]);
  }
  return e ? Et(e) : null;
}
function at(t, e) {
  try {
    const n = Jt(t, e);
    if (Array.isArray(n) && Number.isFinite(n[0]) && Number.isFinite(n[1])) return [n[0], n[1]];
  } catch {
  }
  try {
    if (!Array.isArray(t) || t.length === 0) return [0, 0];
    if (Array.isArray(t[0]) && Array.isArray(t[0][0]) && Array.isArray(t[0][0][0])) {
      const r = yn(t);
      if (r) return r;
    }
    const n = gn(t);
    if (n) return n;
  } catch {
  }
  return [0, 0];
}
const dn = new ArrayBuffer(8), qe = new DataView(dn);
function mn() {
  return 2166136261;
}
function ae(t, e) {
  return t ^= e >>> 0, t = Math.imul(t, 16777619) >>> 0, t;
}
function ne(t, e) {
  const n = Number(e) || 0;
  return qe.setFloat64(0, n, !0), t = ae(t, qe.getUint32(0, !0)), t = ae(t, qe.getUint32(4, !0)), t;
}
function xn(t, e) {
  if (!e) return t;
  for (let n = 0; n < e.length; n++) {
    const r = e.charCodeAt(n);
    t = ae(t, r & 65535);
  }
  return t;
}
function Me(t) {
  if (!t) return 0;
  let e = mn();
  e = xn(e, t.type || "");
  const n = t.type;
  if (n === "Point") {
    const r = t.coordinates || [];
    return e = ne(e, r[0]), e = ne(e, r[1]), e;
  }
  if (n === "LineString" || n === "MultiPoint") {
    const r = t.coordinates || [];
    for (const i of r)
      e = ne(e, i && i[0]), e = ne(e, i && i[1]);
    return e;
  }
  if (n === "Polygon") {
    const r = t.coordinates || [];
    e = ae(e, r.length);
    for (const i of r) {
      e = ae(e, i.length || 0);
      for (const o of i)
        e = ne(e, o && o[0]), e = ne(e, o && o[1]);
    }
    return e;
  }
  if (n === "MultiPolygon") {
    const r = t.coordinates || [];
    e = ae(e, r.length);
    for (const i of r) {
      e = ae(e, i.length || 0);
      for (const o of i) {
        e = ae(e, o.length || 0);
        for (const u of o)
          e = ne(e, u && u[0]), e = ne(e, u && u[1]);
      }
    }
    return e;
  }
  try {
    const r = t.coordinates || [];
    for (const i of r)
      Array.isArray(i) ? (e = ne(e, i[0]), e = ne(e, i[1])) : e = ne(e, i);
  } catch {
  }
  return e;
}
onmessage = (t) => {
  let e = t && t.data;
  if (e && e.type === "diff_ack") {
    try {
      if (pe) {
        for (const f of pe.addList || [])
          if (f && f.id != null)
            try {
              const v = Me(f.geometry);
              z.set(String(f.id), { feature: f, geomHash: v, ts: Date.now() });
            } catch {
              z.set(String(f.id), { feature: f, geomHash: 0, ts: Date.now() });
            }
        for (const f of pe.updateList || [])
          if (f && f.id != null)
            try {
              const v = Me(f.geometry);
              z.set(String(f.id), { feature: f, geomHash: v, ts: Date.now() });
            } catch {
              z.set(String(f.id), { feature: f, geomHash: 0, ts: Date.now() });
            }
        for (const f of pe.removeList || [])
          try {
            z.delete(String(f));
          } catch {
          }
        for (; z.size > Se; ) {
          const f = z.keys().next();
          if (f.done) break;
          z.delete(f.value);
        }
        pe = null;
      }
    } catch {
    }
    return;
  }
  if (e && e.type === "request_full") {
    try {
      const f = Array.from(z.values()).map((N) => N.feature), { meta: v, keys: S, propsBuffer: L, coordsArray: P } = ot(f || [], { pool: lt });
      postMessage({ type: "geojson_bin", meta: v, keys: S, propsBuf: L.buffer, coords: P.buffer }, [L.buffer, P.buffer]);
    } catch {
    }
    return;
  }
  if (e && e.type === "features" && e.payload)
    try {
      const f = e.payload instanceof Uint8Array ? e.payload.buffer : e.payload, v = new TextDecoder().decode(f);
      e = JSON.parse(v);
    } catch {
      e = {};
    }
  if (e && e.type === "features_bin" && e.coords)
    try {
      const f = e.meta || [], v = e.propsBuf !== void 0 ? e.propsBuf : null, S = e.coords, L = e.keys || [];
      e = { features: cn(f, v, S, L), tolerance: t.data && t.data.tolerance, promoteId: t.data && t.data.promoteId, _receivedPropsBuf: v, _receivedCoordsBuf: S, _receivedKeys: L, cacheSize: t.data && t.data.cacheSize };
    } catch {
      e = e || {};
    }
  const n = e || {}, r = n.features || [], i = n.tolerance || 1e-5, o = !0, u = /* @__PURE__ */ new Map();
  for (const f of r) {
    const v = f.id, S = u.get(v) || [];
    S.push(f), u.set(v, S);
  }
  const c = {
    type: "FeatureCollection",
    features: []
  };
  for (const [f, v] of u.entries()) {
    const { clipped: S, ...L } = v[0] && v[0].properties || {};
    let P;
    if (v.length === 1) {
      const N = v[0].geometry;
      P = rt({ type: "Feature", id: f, geometry: N, properties: L }, { tolerance: i, mutate: o });
      try {
        N.coordinates = at(N.coordinates, i), N.type = "Point";
      } catch {
      }
    } else {
      let N = {
        type: "FeatureCollection",
        features: v.map((A) => rt({ type: "Feature", geometry: A.geometry }, { tolerance: i, mutate: o }))
      };
      try {
        v.some((A) => A.properties && A.properties.clipped) && (N = Ht(N)), N = Yt(N), N.features.forEach((A) => {
          try {
            A.geometry.coordinates = at(A.geometry.coordinates, i), A.geometry.type = "Point";
          } catch {
          }
          return A;
        }), N = Xt(N), P = N && N.features && N.features[0] ? N.features[0] : { type: "Feature", id: f, geometry: v[0].geometry, properties: L };
      } catch {
        P = { type: "Feature", id: f, geometry: v[0].geometry, properties: L };
      }
      P.id = f, P.properties = L;
    }
    try {
      P.geometry = hn(P.geometry);
    } catch {
    }
    c.features.push(P);
  }
  const m = n.promoteId;
  if (m)
    for (const f of c.features)
      f.properties || (f.properties = {}), f.id != null && (f.properties[m] === void 0 || f.properties[m] === null) && (f.properties[m] = f.id);
  try {
    e && typeof e.cacheSize == "number" && e.cacheSize > 0 && (Se = e.cacheSize);
    const f = c.features || [];
    if (z.size === 0) {
      for (const C of f)
        if (C && C.id != null) {
          try {
            const F = Me(C.geometry);
            z.set(String(C.id), { feature: C, geomHash: F, ts: Date.now() });
          } catch {
            z.set(String(C.id), { feature: C, geomHash: 0, ts: Date.now() });
          }
          for (; z.size > Se; ) {
            const F = z.keys().next();
            if (F.done) break;
            z.delete(F.value);
          }
        }
      const { meta: x, keys: T, propsBuffer: k, coordsArray: D } = ot(f || [], { pool: lt });
      postMessage({ type: "geojson_bin", meta: x, keys: T, propsBuf: k.buffer, coords: D.buffer }, [k.buffer, D.buffer]);
      return;
    }
    const v = [], S = [], L = /* @__PURE__ */ new Set();
    for (const x of f) {
      if (!x || x.id == null) continue;
      const T = String(x.id), k = z.get(T);
      if (!k)
        v.push(x);
      else {
        let D = 0;
        try {
          D = Me(x.geometry);
        } catch {
          D = 0;
        }
        D !== (k.geomHash || 0) && (S.push(x), L.add(T));
      }
    }
    const P = v.length;
    let N = Math.max(0, z.size + P - Se);
    const A = [];
    if (N > 0) {
      for (const x of z.keys()) {
        if (A.length >= N) break;
        if (L.has(x)) continue;
        const T = z.get(x);
        A.push(T && T.feature && T.feature.id != null ? T.feature.id : x);
      }
      if (A.length < N)
        for (const x of z.keys()) {
          if (A.length >= N) break;
          if (A.includes(x)) continue;
          const T = z.get(x);
          A.push(T && T.feature && T.feature.id != null ? T.feature.id : x);
        }
    }
    if (v.length === 0 && S.length === 0 && A.length === 0)
      return;
    const B = S.map((x) => {
      const T = { id: x.id };
      x.geometry && (T.newGeometry = x.geometry);
      const k = z.get(String(x.id)), D = k && k.feature && k.feature.properties ? k.feature.properties : {}, C = x.properties || {}, F = Object.keys(D), s = Object.keys(C);
      if (s.length === 0 && F.length > 0)
        T.removeAllProperties = !0;
      else {
        const a = F.filter((d) => !(d in C));
        a.length && (T.removeProperties = a);
      }
      const l = s.filter((a) => C[a] !== D[a]).map((a) => ({ key: a, value: C[a] }));
      return l.length && (T.addOrUpdateProperties = l), T;
    });
    pe = { addList: v, updateList: S, removeList: A };
    const O = {};
    A.length && (z.size > 0 && A.length >= z.size ? O.removeAll = !0 : O.remove = A), v.length && (O.add = v), B.length && (O.update = B), postMessage({ type: "geojson_diff", diff: O });
    return;
  } catch {
    try {
      const v = new TextEncoder(), S = JSON.stringify(c), L = v.encode(S);
      postMessage({ type: "geojson", payload: L.buffer }, [L.buffer]);
    } catch {
      postMessage(c);
    }
  }
};
`,vn=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",bn],{type:"text/javascript;charset=utf-8"});function re(i){let n;try{if(n=vn&&(self.URL||self.webkitURL).createObjectURL(vn),!n)throw"";const e=new Worker(n,{type:"module",name:i?.name});return e.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(n)}),e}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(bn),{type:"module",name:i?.name})}}class J{constructor(){this.map=new Map}static _nextPow2(n){return n<=0?0:(n=n-1>>>0,n|=n>>1,n|=n>>2,n|=n>>4,n|=n>>8,n|=n>>16,n+1>>>0)}rent(n){const e=J._nextPow2(n||1),s=this.map.get(e);return s&&s.length?s.pop():new ArrayBuffer(e)}release(n){if(!n||!n.byteLength)return;const e=J._nextPow2(n.byteLength);let s=this.map.get(e);s||(s=[],this.map.set(e,s)),s.push(n)}}let V=!1;function se(i,n={}){const e=[],s=[],r=[],l=new TextEncoder,a=[],p=new Map;let f=0,d=0;const y=w=>{if(Array.isArray(w)){const A=Number(w[0]),m=Number(w[1]);s.push(Number.isFinite(A)?A:0,Number.isFinite(m)?m:0)}else if(w&&(typeof w.x=="number"||typeof w.y=="number")){const A=Number(w.x),m=Number(w.y);s.push(Number.isFinite(A)?A:0,Number.isFinite(m)?m:0)}else s.push(0,0)};for(const w of i){const A=w.id==null?"":String(w.id),m=w.geometry||{},P=m.type||"Unknown",b={id:A,type:P,coordsOffset:f,coordsLength:0};if(P==="Point"){const F=m.coordinates||[];y(F),b.coordsLength=2}else if(P==="LineString"||P==="MultiPoint"){const F=m.coordinates||[];for(const E of F)y(E);b.coordsLength=(F.length||0)*2}else if(P==="Polygon"){const F=m.coordinates||[];b.ringLengths=[];for(const E of F){b.ringLengths.push(E.length||0);for(const L of E)y(L)}b.coordsLength=b.ringLengths.reduce((E,L)=>E+L,0)*2}else if(P==="MultiPolygon"){const F=m.coordinates||[];b.polygonRingCounts=[],b.ringLengths=[];for(const E of F){b.polygonRingCounts.push(E.length||0);for(const L of E){b.ringLengths.push(L.length||0);for(const k of L)y(k)}}b.coordsLength=b.ringLengths.reduce((E,L)=>E+L,0)*2}else b.coordsLength=0;const _=w.properties||{},T=[];for(const F of Object.keys(_)){let E=p.get(F);E===void 0&&(E=a.length,a.push(F),p.set(F,E));const L=JSON.stringify(_[F]),k=l.encode(L);r.push(k),T.push([E,d,k.length]),d+=k.length}b.props=T,f+=b.coordsLength,e.push(b)}let x;if(n.propsBuffer)n.propsBuffer instanceof Uint8Array?x=n.propsBuffer.subarray(0,d):x=new Uint8Array(n.propsBuffer,0,d),x.byteLength<d&&(x=new Uint8Array(d));else if(n.pool){const w=n.pool.rent(d||1);x=new Uint8Array(w,0,d)}else x=new Uint8Array(d);let u=0;for(const w of r)x.set(w,u),u+=w.length;const c=s.length;let g;if(n.coordsBuffer)n.coordsBuffer instanceof ArrayBuffer?g=new Float32Array(n.coordsBuffer,0,c):n.coordsBuffer instanceof Float32Array?g=n.coordsBuffer.subarray(0,c):g=new Float32Array(c),g.length<c&&(g=new Float32Array(c));else if(n.pool){const w=n.pool.rent(c*4||4);g=new Float32Array(w,0,c)}else g=new Float32Array(c);return g.length>0&&g.set(s),{meta:e,keys:a,propsBuffer:x,coordsArray:g}}function oe(i,n,e,s){const r=e instanceof Float32Array?e:new Float32Array(e),l=n instanceof Uint8Array?n:n?new Uint8Array(n):new Uint8Array(0),a=new TextDecoder,p=[];for(let f=0;f<(i.length||0);f++){const d=i[f]||{},y=d.id,x={};if(Array.isArray(d.props)&&d.props.length&&s&&s.length)for(const m of d.props){const[P,b,_]=m;try{const T=l.subarray(b,b+_);x[s[P]]=JSON.parse(a.decode(T))}catch{}}const u=d.type||"Unknown";let c=d.coordsOffset||0;const g=c+(d.coordsLength||0);let w=null;if(u==="Point"){const m=r[c],P=r[c+1],b=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,_=Number.isFinite(P)?Math.max(-90,Math.min(90,P)):0;if((!Number.isFinite(m)||!Number.isFinite(P))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value",{index:f,id:y,rawX:m,rawY:P})}catch{}}w={type:"Point",coordinates:[b,_]}}else if(u==="LineString"||u==="MultiPoint"){const m=[];for(;c<g;c+=2){const P=r[c],b=r[c+1],_=Number.isFinite(P)?Math.max(-180,Math.min(180,P)):0,T=Number.isFinite(b)?Math.max(-90,Math.min(90,b)):0;if((!Number.isFinite(P)||!Number.isFinite(b))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value",{index:f,id:y,rawX:P,rawY:b})}catch{}}m.push([_,T])}w={type:u,coordinates:m}}else if(u==="Polygon"){const m=[],P=d.ringLengths||[];for(const b of P){const _=[];for(let T=0;T<b;T++){const F=r[c],E=r[c+1],L=Number.isFinite(F)?Math.max(-180,Math.min(180,F)):0,k=Number.isFinite(E)?Math.max(-90,Math.min(90,E)):0;if((!Number.isFinite(F)||!Number.isFinite(E))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value",{index:f,id:y,rawX:F,rawY:E})}catch{}}_.push([L,k]),c+=2}m.push(_)}w={type:"Polygon",coordinates:m}}else if(u==="MultiPolygon"){const m=[],P=d.polygonRingCounts||[],b=d.ringLengths||[];let _=0;for(const T of P){const F=[];for(let E=0;E<T;E++){const L=b[_++]||0,k=[];for(let z=0;z<L;z++){const G=r[c],t=r[c+1],o=Number.isFinite(G)?Math.max(-180,Math.min(180,G)):0,h=Number.isFinite(t)?Math.max(-90,Math.min(90,t)):0;if((!Number.isFinite(G)||!Number.isFinite(t))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value",{index:f,id:y,rawX:G,rawY:t})}catch{}}k.push([o,h]),c+=2}F.push(k)}m.push(F)}w={type:"MultiPolygon",coordinates:m}}else if(c<g){const m=r[c],P=r[c+1],b=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,_=Number.isFinite(P)?Math.max(-90,Math.min(90,P)):0;if((!Number.isFinite(m)||!Number.isFinite(P))&&!V){V=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value",{index:f,id:y,rawX:m,rawY:P})}catch{}}w={type:"Point",coordinates:[b,_]}}w==null&&(w={type:"Point",coordinates:[0,0]});const A=x&&typeof x=="object"?x:{};p.push({type:"Feature",id:y,geometry:w,properties:A})}return p}class Sn{constructor(n){return this.map=n.map,this.source=n.source instanceof maplibregl.VectorTileSource?n.source:this.map.getSource(n.source),this.sourceLayer=n.sourceLayer,this.fid=n.fid||"id",this.tiles=this.source.tiles.map(e=>e.split("{z}")[0]),this.tileSize=this.source.tileSize||512,this.tolerance=n.tolerance||1e-5,this.cacheSize=n.cacheSize||1e4,this.minion=new re,this._abPool=new J,this.minion.onmessage=e=>{const s=e&&e.data;if(s)if(s.type==="geojson_bin"&&s.coords)try{const r=s.coords instanceof Uint8Array?s.coords.buffer:s.coords,l=s.propsBuf!==void 0?s.propsBuf:null,a=oe(s.meta||[],l,r,s.keys||[]);this.gjsource.setData({type:"FeatureCollection",features:a});try{l&&this._abPool.release(l instanceof ArrayBuffer?l:l.buffer)}catch{}try{r&&this._abPool.release(r instanceof ArrayBuffer?r:r.buffer)}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch(r){console.warn("Failed to decode binary worker response",r)}else if(s.type==="geojson_diff")try{const r=s&&s.diff?s.diff:{};if(this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(r);try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(r){console.warn("Failed to process geojson diff from worker",r)}else if(s.type==="geojson"&&s.payload)try{const r=s.payload instanceof Uint8Array?s.payload.buffer:s.payload,l=new TextDecoder().decode(r),a=JSON.parse(l);this.gjsource.setData(a)}catch(r){console.warn("Failed to decode worker response",r)}else try{this.gjsource.setData(s)}catch(r){console.warn("Failed to set worker data",r)}},this.map.addSource(this.source.id+"-proper",{type:"geojson",maxzoom:this.source.maxzoom,promoteId:this.fid,data:{}}),this.gjsource=this.map.getSource(this.source.id+"-proper"),maplibregl.addProtocol("proper",this._protocol),this.map.setTransformRequest((e,s)=>this.tiles.some(l=>e.startsWith(l))&&s==="Tile"?{url:"proper://"+e}:{url:e}),this._pendingPost=null,this._postTimer=null,this._postDelay=n.postDelay||100,this.map.on("sourcedata",e=>{if(e.sourceId===this.source.id&&e.isSourceLoaded){const s=this.map.querySourceFeatures(this.source.id,{sourceLayer:this.sourceLayer}),r=e.tile.tileID.canonical.z,l=this.tolerance*Math.pow(10,-.301*r+5.19),a={features:s.map(p=>({id:p.id,geometry:p.geometry,properties:p.properties})),tolerance:l};this._pendingPost=a,this._postTimer==null&&(this._postTimer=setTimeout(()=>{try{if(this._pendingPost)try{const{meta:p,keys:f,propsBuffer:d,coordsArray:y}=se(this._pendingPost.features||[],{pool:this._abPool});this.minion.postMessage({type:"features_bin",meta:p,keys:f,propsBuf:d.buffer,tolerance:this._pendingPost.tolerance,coords:y.buffer,cacheSize:this.cacheSize,promoteId:this.fid},[d.buffer,y.buffer])}catch{try{const f=new TextEncoder,d=Object.assign({},this._pendingPost,{promoteId:this.fid}),y=JSON.stringify(d),x=f.encode(y);this.minion.postMessage({type:"features",payload:x.buffer},[x.buffer])}catch{const d=Object.assign({},this._pendingPost,{promoteId:this.fid});this.minion.postMessage(d)}}}finally{this._pendingPost=null,this._postTimer=null}},this._postDelay))}}),this.map.refreshTiles(this.source.id),this.gjsource}_protocol=async n=>{const s=n.url.replace("proper://",""),r=n.url.split(/\/|\./i);if(r===null||r.length<4)return console.warn(`Malformed URL: ${n.url}`),{data:null};const l=await fetch(s);if(!l.ok)return console.warn(`Failed to fetch tile: ${l.statusText}`),{data:null};const a=r.length,[p,f,d]=r.slice(a-4,a-1).map(w=>w*1),y=await l.arrayBuffer(),x=new Kn(new En(y)),u={layers:Object.entries(x.layers).reduce((w,[A,m])=>({...w,[A]:{...m,feature:P=>{const b=m.feature(P),T=b.loadGeometry().flat(1/0).some(F=>F.x>=m.extent-1||F.y>=m.extent-1||F.x<=1||F.y<=1);return b.properties.clipped=T,b}}}),{})};return{data:ie(u).buffer}}}return maplibregl.VectorTileSource.prototype.ProperLabels=function(i){return this._proper||(this._proper=new Sn({map:this._map,source:this})),this._proper},Sn}));
