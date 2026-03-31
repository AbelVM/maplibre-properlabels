"use strict";const rn=23283064365386963e-26,Pn=12,sn=typeof TextDecoder>"u"?null:new TextDecoder("utf-8"),J=0,H=1,q=2,z=5;class Fn{constructor(n=new Uint8Array(16)){this.buf=ArrayBuffer.isView(n)?n:new Uint8Array(n),this.dataView=new DataView(this.buf.buffer),this.pos=0,this.type=0,this.length=this.buf.length}readFields(n,e,s=this.length){for(;this.pos<s;){const i=this.readVarint(),l=i>>3,a=this.pos;this.type=i&7,n(l,e,this),this.pos===a&&this.skip(i)}return e}readMessage(n,e){return this.readFields(n,e,this.readVarint()+this.pos)}readFixed32(){const n=this.dataView.getUint32(this.pos,!0);return this.pos+=4,n}readSFixed32(){const n=this.dataView.getInt32(this.pos,!0);return this.pos+=4,n}readFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getUint32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readSFixed64(){const n=this.dataView.getUint32(this.pos,!0)+this.dataView.getInt32(this.pos+4,!0)*4294967296;return this.pos+=8,n}readFloat(){const n=this.dataView.getFloat32(this.pos,!0);return this.pos+=4,n}readDouble(){const n=this.dataView.getFloat64(this.pos,!0);return this.pos+=8,n}readVarint(n){const e=this.buf;let s,i;return i=e[this.pos++],s=i&127,i<128||(i=e[this.pos++],s|=(i&127)<<7,i<128)||(i=e[this.pos++],s|=(i&127)<<14,i<128)||(i=e[this.pos++],s|=(i&127)<<21,i<128)?s:(i=e[this.pos],s|=(i&15)<<28,En(s,n,this))}readVarint64(){return this.readVarint(!0)}readSVarint(){const n=this.readVarint();return n%2===1?(n+1)/-2:n/2}readBoolean(){return!!this.readVarint()}readString(){const n=this.readVarint()+this.pos,e=this.pos;return this.pos=n,n-e>=Pn&&sn?sn.decode(this.buf.subarray(e,n)):In(this.buf,e,n)}readBytes(){const n=this.readVarint()+this.pos,e=this.buf.subarray(this.pos,n);return this.pos=n,e}readPackedVarint(n=[],e){const s=this.readPackedEnd();for(;this.pos<s;)n.push(this.readVarint(e));return n}readPackedSVarint(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSVarint());return n}readPackedBoolean(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readBoolean());return n}readPackedFloat(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFloat());return n}readPackedDouble(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readDouble());return n}readPackedFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed32());return n}readPackedSFixed32(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed32());return n}readPackedFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readFixed64());return n}readPackedSFixed64(n=[]){const e=this.readPackedEnd();for(;this.pos<e;)n.push(this.readSFixed64());return n}readPackedEnd(){return this.type===q?this.readVarint()+this.pos:this.pos+1}skip(n){const e=n&7;if(e===J)for(;this.buf[this.pos++]>127;);else if(e===q)this.pos=this.readVarint()+this.pos;else if(e===z)this.pos+=4;else if(e===H)this.pos+=8;else throw new Error(`Unimplemented type: ${e}`)}writeTag(n,e){this.writeVarint(n<<3|e)}realloc(n){let e=this.length||16;for(;e<this.pos+n;)e*=2;if(e!==this.length){const s=new Uint8Array(e);s.set(this.buf),this.buf=s,this.dataView=new DataView(s.buffer),this.length=e}}finish(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)}writeFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeSFixed32(n){this.realloc(4),this.dataView.setInt32(this.pos,n,!0),this.pos+=4}writeFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*rn),!0),this.pos+=8}writeSFixed64(n){this.realloc(8),this.dataView.setInt32(this.pos,n&-1,!0),this.dataView.setInt32(this.pos+4,Math.floor(n*rn),!0),this.pos+=8}writeVarint(n){if(n=+n||0,n>268435455||n<0){Mn(n,this);return}this.realloc(4),this.buf[this.pos++]=n&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=(n>>>=7)&127|(n>127?128:0),!(n<=127)&&(this.buf[this.pos++]=n>>>7&127)))}writeSVarint(n){this.writeVarint(n<0?-n*2-1:n*2)}writeBoolean(n){this.writeVarint(+n)}writeString(n){n=String(n),this.realloc(n.length*4),this.pos++;const e=this.pos;this.pos=Dn(this.buf,n,this.pos);const s=this.pos-e;s>=128&&on(e,s,this),this.pos=e-1,this.writeVarint(s),this.pos+=s}writeFloat(n){this.realloc(4),this.dataView.setFloat32(this.pos,n,!0),this.pos+=4}writeDouble(n){this.realloc(8),this.dataView.setFloat64(this.pos,n,!0),this.pos+=8}writeBytes(n){const e=n.length;this.writeVarint(e),this.realloc(e);for(let s=0;s<e;s++)this.buf[this.pos++]=n[s]}writeRawMessage(n,e){this.pos++;const s=this.pos;n(e,this);const i=this.pos-s;i>=128&&on(s,i,this),this.pos=s-1,this.writeVarint(i),this.pos+=i}writeMessage(n,e,s){this.writeTag(n,q),this.writeRawMessage(e,s)}writePackedVarint(n,e){e.length&&this.writeMessage(n,Ln,e)}writePackedSVarint(n,e){e.length&&this.writeMessage(n,kn,e)}writePackedBoolean(n,e){e.length&&this.writeMessage(n,Nn,e)}writePackedFloat(n,e){e.length&&this.writeMessage(n,Tn,e)}writePackedDouble(n,e){e.length&&this.writeMessage(n,On,e)}writePackedFixed32(n,e){e.length&&this.writeMessage(n,Bn,e)}writePackedSFixed32(n,e){e.length&&this.writeMessage(n,Rn,e)}writePackedFixed64(n,e){e.length&&this.writeMessage(n,Vn,e)}writePackedSFixed64(n,e){e.length&&this.writeMessage(n,Cn,e)}writeBytesField(n,e){this.writeTag(n,q),this.writeBytes(e)}writeFixed32Field(n,e){this.writeTag(n,z),this.writeFixed32(e)}writeSFixed32Field(n,e){this.writeTag(n,z),this.writeSFixed32(e)}writeFixed64Field(n,e){this.writeTag(n,H),this.writeFixed64(e)}writeSFixed64Field(n,e){this.writeTag(n,H),this.writeSFixed64(e)}writeVarintField(n,e){this.writeTag(n,J),this.writeVarint(e)}writeSVarintField(n,e){this.writeTag(n,J),this.writeSVarint(e)}writeStringField(n,e){this.writeTag(n,q),this.writeString(e)}writeFloatField(n,e){this.writeTag(n,z),this.writeFloat(e)}writeDoubleField(n,e){this.writeTag(n,H),this.writeDouble(e)}writeBooleanField(n,e){this.writeVarintField(n,+e)}}function En(r,n,e){const s=e.buf;let i,l;if(l=s[e.pos++],i=(l&112)>>4,l<128||(l=s[e.pos++],i|=(l&127)<<3,l<128)||(l=s[e.pos++],i|=(l&127)<<10,l<128)||(l=s[e.pos++],i|=(l&127)<<17,l<128)||(l=s[e.pos++],i|=(l&127)<<24,l<128)||(l=s[e.pos++],i|=(l&1)<<31,l<128))return D(r,i,n);throw new Error("Expected varint not more than 10 bytes")}function D(r,n,e){return e?n*4294967296+(r>>>0):(n>>>0)*4294967296+(r>>>0)}function Mn(r,n){let e,s;if(r>=0?(e=r%4294967296|0,s=r/4294967296|0):(e=~(-r%4294967296),s=~(-r/4294967296),e^4294967295?e=e+1|0:(e=0,s=s+1|0)),r>=18446744073709552e3||r<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");n.realloc(10),_n(e,s,n),An(s,n)}function _n(r,n,e){e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos++]=r&127|128,r>>>=7,e.buf[e.pos]=r&127}function An(r,n){const e=(r&7)<<4;n.buf[n.pos++]|=e|((r>>>=3)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127|((r>>>=7)?128:0),r&&(n.buf[n.pos++]=r&127)))))}function on(r,n,e){const s=n<=16383?1:n<=2097151?2:n<=268435455?3:Math.floor(Math.log(n)/(Math.LN2*7));e.realloc(s);for(let i=e.pos-1;i>=r;i--)e.buf[i+s]=e.buf[i]}function Ln(r,n){for(let e=0;e<r.length;e++)n.writeVarint(r[e])}function kn(r,n){for(let e=0;e<r.length;e++)n.writeSVarint(r[e])}function Tn(r,n){for(let e=0;e<r.length;e++)n.writeFloat(r[e])}function On(r,n){for(let e=0;e<r.length;e++)n.writeDouble(r[e])}function Nn(r,n){for(let e=0;e<r.length;e++)n.writeBoolean(r[e])}function Bn(r,n){for(let e=0;e<r.length;e++)n.writeFixed32(r[e])}function Rn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed32(r[e])}function Vn(r,n){for(let e=0;e<r.length;e++)n.writeFixed64(r[e])}function Cn(r,n){for(let e=0;e<r.length;e++)n.writeSFixed64(r[e])}function In(r,n,e){let s="",i=n;for(;i<e;){const l=r[i];let a=null,p=l>239?4:l>223?3:l>191?2:1;if(i+p>e)break;let c,g,y;p===1?l<128&&(a=l):p===2?(c=r[i+1],(c&192)===128&&(a=(l&31)<<6|c&63,a<=127&&(a=null))):p===3?(c=r[i+1],g=r[i+2],(c&192)===128&&(g&192)===128&&(a=(l&15)<<12|(c&63)<<6|g&63,(a<=2047||a>=55296&&a<=57343)&&(a=null))):p===4&&(c=r[i+1],g=r[i+2],y=r[i+3],(c&192)===128&&(g&192)===128&&(y&192)===128&&(a=(l&15)<<18|(c&63)<<12|(g&63)<<6|y&63,(a<=65535||a>=1114112)&&(a=null))),a===null?(a=65533,p=1):a>65535&&(a-=65536,s+=String.fromCharCode(a>>>10&1023|55296),a=56320|a&1023),s+=String.fromCharCode(a),i+=p}return s}function Dn(r,n,e){for(let s=0,i,l;s<n.length;s++){if(i=n.charCodeAt(s),i>55295&&i<57344)if(l)if(i<56320){r[e++]=239,r[e++]=191,r[e++]=189,l=i;continue}else i=l-55296<<10|i-56320|65536,l=null;else{i>56319||s+1===n.length?(r[e++]=239,r[e++]=191,r[e++]=189):l=i;continue}else l&&(r[e++]=239,r[e++]=191,r[e++]=189,l=null);i<128?r[e++]=i:(i<2048?r[e++]=i>>6|192:(i<65536?r[e++]=i>>12|224:(r[e++]=i>>18|240,r[e++]=i>>12&63|128),r[e++]=i>>6&63|128),r[e++]=i&63|128)}return e}function R(r,n){this.x=r,this.y=n}R.prototype={clone(){return new R(this.x,this.y)},add(r){return this.clone()._add(r)},sub(r){return this.clone()._sub(r)},multByPoint(r){return this.clone()._multByPoint(r)},divByPoint(r){return this.clone()._divByPoint(r)},mult(r){return this.clone()._mult(r)},div(r){return this.clone()._div(r)},rotate(r){return this.clone()._rotate(r)},rotateAround(r,n){return this.clone()._rotateAround(r,n)},matMult(r){return this.clone()._matMult(r)},unit(){return this.clone()._unit()},perp(){return this.clone()._perp()},round(){return this.clone()._round()},mag(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals(r){return this.x===r.x&&this.y===r.y},dist(r){return Math.sqrt(this.distSqr(r))},distSqr(r){const n=r.x-this.x,e=r.y-this.y;return n*n+e*e},angle(){return Math.atan2(this.y,this.x)},angleTo(r){return Math.atan2(this.y-r.y,this.x-r.x)},angleWith(r){return this.angleWithSep(r.x,r.y)},angleWithSep(r,n){return Math.atan2(this.x*n-this.y*r,this.x*r+this.y*n)},_matMult(r){const n=r[0]*this.x+r[1]*this.y,e=r[2]*this.x+r[3]*this.y;return this.x=n,this.y=e,this},_add(r){return this.x+=r.x,this.y+=r.y,this},_sub(r){return this.x-=r.x,this.y-=r.y,this},_mult(r){return this.x*=r,this.y*=r,this},_div(r){return this.x/=r,this.y/=r,this},_multByPoint(r){return this.x*=r.x,this.y*=r.y,this},_divByPoint(r){return this.x/=r.x,this.y/=r.y,this},_unit(){return this._div(this.mag()),this},_perp(){const r=this.y;return this.y=this.x,this.x=-r,this},_rotate(r){const n=Math.cos(r),e=Math.sin(r),s=n*this.x-e*this.y,i=e*this.x+n*this.y;return this.x=s,this.y=i,this},_rotateAround(r,n){const e=Math.cos(r),s=Math.sin(r),i=n.x+e*(this.x-n.x)-s*(this.y-n.y),l=n.y+s*(this.x-n.x)+e*(this.y-n.y);return this.x=i,this.y=l,this},_round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},constructor:R};R.convert=function(r){if(r instanceof R)return r;if(Array.isArray(r))return new R(+r[0],+r[1]);if(r.x!==void 0&&r.y!==void 0)return new R(+r.x,+r.y);throw new Error("Expected [x, y] or {x, y} point format")};class xn{constructor(n,e,s,i,l){this.properties={},this.extent=s,this.type=0,this.id=void 0,this._pbf=n,this._geometry=-1,this._keys=i,this._values=l,n.readFields(Gn,this,e)}loadGeometry(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos,s=[];let i,l=1,a=0,p=0,c=0;for(;n.pos<e;){if(a<=0){const g=n.readVarint();l=g&7,a=g>>3}if(a--,l===1||l===2)p+=n.readSVarint(),c+=n.readSVarint(),l===1&&(i&&s.push(i),i=[]),i&&i.push(new R(p,c));else if(l===7)i&&i.push(i[0].clone());else throw new Error(`unknown command ${l}`)}return i&&s.push(i),s}bbox(){const n=this._pbf;n.pos=this._geometry;const e=n.readVarint()+n.pos;let s=1,i=0,l=0,a=0,p=1/0,c=-1/0,g=1/0,y=-1/0;for(;n.pos<e;){if(i<=0){const x=n.readVarint();s=x&7,i=x>>3}if(i--,s===1||s===2)l+=n.readSVarint(),a+=n.readSVarint(),l<p&&(p=l),l>c&&(c=l),a<g&&(g=a),a>y&&(y=a);else if(s!==7)throw new Error(`unknown command ${s}`)}return[p,g,c,y]}toGeoJSON(n,e,s){const i=this.extent*Math.pow(2,s),l=this.extent*n,a=this.extent*e,p=this.loadGeometry();function c(u){return[(u.x+l)*360/i-180,360/Math.PI*Math.atan(Math.exp((1-(u.y+a)*2/i)*Math.PI))-90]}function g(u){return u.map(c)}let y;if(this.type===1){const u=[];for(const d of p)u.push(d[0]);const f=g(u);y=u.length===1?{type:"Point",coordinates:f[0]}:{type:"MultiPoint",coordinates:f}}else if(this.type===2){const u=p.map(g);y=u.length===1?{type:"LineString",coordinates:u[0]}:{type:"MultiLineString",coordinates:u}}else if(this.type===3){const u=qn(p),f=[];for(const d of u)f.push(d.map(g));y=f.length===1?{type:"Polygon",coordinates:f[0]}:{type:"MultiPolygon",coordinates:f}}else throw new Error("unknown feature type");const x={type:"Feature",geometry:y,properties:this.properties};return this.id!=null&&(x.id=this.id),x}}xn.types=["Unknown","Point","LineString","Polygon"];function Gn(r,n,e){r===1?n.id=e.readVarint():r===2?Un(e,n):r===3?n.type=e.readVarint():r===4&&(n._geometry=e.pos)}function Un(r,n){const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=n._keys[r.readVarint()],i=n._values[r.readVarint()];n.properties[s]=i}}function qn(r){const n=r.length;if(n<=1)return[r];const e=[];let s,i;for(let l=0;l<n;l++){const a=jn(r[l]);a!==0&&(i===void 0&&(i=a<0),i===a<0?(s&&e.push(s),s=[r[l]]):s&&s.push(r[l]))}return s&&e.push(s),e}function jn(r){let n=0;for(let e=0,s=r.length,i=s-1,l,a;e<s;i=e++)l=r[e],a=r[i],n+=(a.x-l.x)*(l.y+a.y);return n}class Hn{constructor(n,e){this.version=1,this.name="",this.extent=4096,this.length=0,this._pbf=n,this._keys=[],this._values=[],this._features=[],n.readFields(zn,this,e),this.length=this._features.length}feature(n){if(n<0||n>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[n];const e=this._pbf.readVarint()+this._pbf.pos;return new xn(this._pbf,e,this.extent,this._keys,this._values)}}function zn(r,n,e){r===15?n.version=e.readVarint():r===1?n.name=e.readString():r===5?n.extent=e.readVarint():r===2?n._features.push(e.pos):r===3?n._keys.push(e.readString()):r===4&&n._values.push(Kn(e))}function Kn(r){let n=null;const e=r.readVarint()+r.pos;for(;r.pos<e;){const s=r.readVarint()>>3;n=s===1?r.readString():s===2?r.readFloat():s===3?r.readDouble():s===4?r.readVarint64():s===5?r.readVarint():s===6?r.readSVarint():s===7?r.readBoolean():null}if(n==null)throw new Error("unknown feature value");return n}class $n{constructor(n,e){this.layers=n.readFields(Wn,{},e)}}function Wn(r,n,e){if(r===3){const s=new Hn(e,e.readVarint()+e.pos);s.length&&(n[s.name]=s)}}function Jn(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var G={exports:{}},K={};var an;function Xn(){return an||(an=1,K.read=function(r,n,e,s,i){var l,a,p=i*8-s-1,c=(1<<p)-1,g=c>>1,y=-7,x=e?i-1:0,u=e?-1:1,f=r[n+x];for(x+=u,l=f&(1<<-y)-1,f>>=-y,y+=p;y>0;l=l*256+r[n+x],x+=u,y-=8);for(a=l&(1<<-y)-1,l>>=-y,y+=s;y>0;a=a*256+r[n+x],x+=u,y-=8);if(l===0)l=1-g;else{if(l===c)return a?NaN:(f?-1:1)*(1/0);a=a+Math.pow(2,s),l=l-g}return(f?-1:1)*a*Math.pow(2,l-s)},K.write=function(r,n,e,s,i,l){var a,p,c,g=l*8-i-1,y=(1<<g)-1,x=y>>1,u=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,f=s?0:l-1,d=s?1:-1,w=n<0||n===0&&1/n<0?1:0;for(n=Math.abs(n),isNaN(n)||n===1/0?(p=isNaN(n)?1:0,a=y):(a=Math.floor(Math.log(n)/Math.LN2),n*(c=Math.pow(2,-a))<1&&(a--,c*=2),a+x>=1?n+=u/c:n+=u*Math.pow(2,1-x),n*c>=2&&(a++,c/=2),a+x>=y?(p=0,a=y):a+x>=1?(p=(n*c-1)*Math.pow(2,i),a=a+x):(p=n*Math.pow(2,x-1)*Math.pow(2,i),a=0));i>=8;r[e+f]=p&255,f+=d,p/=256,i-=8);for(a=a<<i|p,g+=i;g>0;r[e+f]=a&255,f+=d,a/=256,g-=8);r[e+f-d]|=w*128}),K}var X,un;function Yn(){if(un)return X;un=1,X=n;var r=Xn();function n(t){this.buf=ArrayBuffer.isView&&ArrayBuffer.isView(t)?t:new Uint8Array(t||0),this.pos=0,this.type=0,this.length=this.buf.length}n.Varint=0,n.Fixed64=1,n.Bytes=2,n.Fixed32=5;var e=65536*65536,s=1/e,i=12,l=typeof TextDecoder>"u"?null:new TextDecoder("utf-8");n.prototype={destroy:function(){this.buf=null},readFields:function(t,o,h){for(h=h||this.length;this.pos<h;){var v=this.readVarint(),S=v>>3,A=this.pos;this.type=v&7,t(S,o,this),this.pos===A&&this.skip(v)}return o},readMessage:function(t,o){return this.readFields(t,o,this.readVarint()+this.pos)},readFixed32:function(){var t=F(this.buf,this.pos);return this.pos+=4,t},readSFixed32:function(){var t=k(this.buf,this.pos);return this.pos+=4,t},readFixed64:function(){var t=F(this.buf,this.pos)+F(this.buf,this.pos+4)*e;return this.pos+=8,t},readSFixed64:function(){var t=F(this.buf,this.pos)+k(this.buf,this.pos+4)*e;return this.pos+=8,t},readFloat:function(){var t=r.read(this.buf,this.pos,!0,23,4);return this.pos+=4,t},readDouble:function(){var t=r.read(this.buf,this.pos,!0,52,8);return this.pos+=8,t},readVarint:function(t){var o=this.buf,h,v;return v=o[this.pos++],h=v&127,v<128||(v=o[this.pos++],h|=(v&127)<<7,v<128)||(v=o[this.pos++],h|=(v&127)<<14,v<128)||(v=o[this.pos++],h|=(v&127)<<21,v<128)?h:(v=o[this.pos],h|=(v&15)<<28,a(h,t,this))},readVarint64:function(){return this.readVarint(!0)},readSVarint:function(){var t=this.readVarint();return t%2===1?(t+1)/-2:t/2},readBoolean:function(){return!!this.readVarint()},readString:function(){var t=this.readVarint()+this.pos,o=this.pos;return this.pos=t,t-o>=i&&l?U(this.buf,o,t):O(this.buf,o,t)},readBytes:function(){var t=this.readVarint()+this.pos,o=this.buf.subarray(this.pos,t);return this.pos=t,o},readPackedVarint:function(t,o){if(this.type!==n.Bytes)return t.push(this.readVarint(o));var h=p(this);for(t=t||[];this.pos<h;)t.push(this.readVarint(o));return t},readPackedSVarint:function(t){if(this.type!==n.Bytes)return t.push(this.readSVarint());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readSVarint());return t},readPackedBoolean:function(t){if(this.type!==n.Bytes)return t.push(this.readBoolean());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readBoolean());return t},readPackedFloat:function(t){if(this.type!==n.Bytes)return t.push(this.readFloat());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readFloat());return t},readPackedDouble:function(t){if(this.type!==n.Bytes)return t.push(this.readDouble());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readDouble());return t},readPackedFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed32());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readFixed32());return t},readPackedSFixed32:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed32());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readSFixed32());return t},readPackedFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readFixed64());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readFixed64());return t},readPackedSFixed64:function(t){if(this.type!==n.Bytes)return t.push(this.readSFixed64());var o=p(this);for(t=t||[];this.pos<o;)t.push(this.readSFixed64());return t},skip:function(t){var o=t&7;if(o===n.Varint)for(;this.buf[this.pos++]>127;);else if(o===n.Bytes)this.pos=this.readVarint()+this.pos;else if(o===n.Fixed32)this.pos+=4;else if(o===n.Fixed64)this.pos+=8;else throw new Error("Unimplemented type: "+o)},writeTag:function(t,o){this.writeVarint(t<<3|o)},realloc:function(t){for(var o=this.length||16;o<this.pos+t;)o*=2;if(o!==this.length){var h=new Uint8Array(o);h.set(this.buf),this.buf=h,this.length=o}},finish:function(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)},writeFixed32:function(t){this.realloc(4),E(this.buf,t,this.pos),this.pos+=4},writeSFixed32:function(t){this.realloc(4),E(this.buf,t,this.pos),this.pos+=4},writeFixed64:function(t){this.realloc(8),E(this.buf,t&-1,this.pos),E(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeSFixed64:function(t){this.realloc(8),E(this.buf,t&-1,this.pos),E(this.buf,Math.floor(t*s),this.pos+4),this.pos+=8},writeVarint:function(t){if(t=+t||0,t>268435455||t<0){g(t,this);return}this.realloc(4),this.buf[this.pos++]=t&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=(t>>>=7)&127|(t>127?128:0),!(t<=127)&&(this.buf[this.pos++]=t>>>7&127)))},writeSVarint:function(t){this.writeVarint(t<0?-t*2-1:t*2)},writeBoolean:function(t){this.writeVarint(!!t)},writeString:function(t){t=String(t),this.realloc(t.length*4),this.pos++;var o=this.pos;this.pos=C(this.buf,t,this.pos);var h=this.pos-o;h>=128&&u(o,h,this),this.pos=o-1,this.writeVarint(h),this.pos+=h},writeFloat:function(t){this.realloc(4),r.write(this.buf,t,this.pos,!0,23,4),this.pos+=4},writeDouble:function(t){this.realloc(8),r.write(this.buf,t,this.pos,!0,52,8),this.pos+=8},writeBytes:function(t){var o=t.length;this.writeVarint(o),this.realloc(o);for(var h=0;h<o;h++)this.buf[this.pos++]=t[h]},writeRawMessage:function(t,o){this.pos++;var h=this.pos;t(o,this);var v=this.pos-h;v>=128&&u(h,v,this),this.pos=h-1,this.writeVarint(v),this.pos+=v},writeMessage:function(t,o,h){this.writeTag(t,n.Bytes),this.writeRawMessage(o,h)},writePackedVarint:function(t,o){o.length&&this.writeMessage(t,f,o)},writePackedSVarint:function(t,o){o.length&&this.writeMessage(t,d,o)},writePackedBoolean:function(t,o){o.length&&this.writeMessage(t,m,o)},writePackedFloat:function(t,o){o.length&&this.writeMessage(t,w,o)},writePackedDouble:function(t,o){o.length&&this.writeMessage(t,M,o)},writePackedFixed32:function(t,o){o.length&&this.writeMessage(t,P,o)},writePackedSFixed32:function(t,o){o.length&&this.writeMessage(t,b,o)},writePackedFixed64:function(t,o){o.length&&this.writeMessage(t,_,o)},writePackedSFixed64:function(t,o){o.length&&this.writeMessage(t,L,o)},writeBytesField:function(t,o){this.writeTag(t,n.Bytes),this.writeBytes(o)},writeFixed32Field:function(t,o){this.writeTag(t,n.Fixed32),this.writeFixed32(o)},writeSFixed32Field:function(t,o){this.writeTag(t,n.Fixed32),this.writeSFixed32(o)},writeFixed64Field:function(t,o){this.writeTag(t,n.Fixed64),this.writeFixed64(o)},writeSFixed64Field:function(t,o){this.writeTag(t,n.Fixed64),this.writeSFixed64(o)},writeVarintField:function(t,o){this.writeTag(t,n.Varint),this.writeVarint(o)},writeSVarintField:function(t,o){this.writeTag(t,n.Varint),this.writeSVarint(o)},writeStringField:function(t,o){this.writeTag(t,n.Bytes),this.writeString(o)},writeFloatField:function(t,o){this.writeTag(t,n.Fixed32),this.writeFloat(o)},writeDoubleField:function(t,o){this.writeTag(t,n.Fixed64),this.writeDouble(o)},writeBooleanField:function(t,o){this.writeVarintField(t,!!o)}};function a(t,o,h){var v=h.buf,S,A;if(A=v[h.pos++],S=(A&112)>>4,A<128||(A=v[h.pos++],S|=(A&127)<<3,A<128)||(A=v[h.pos++],S|=(A&127)<<10,A<128)||(A=v[h.pos++],S|=(A&127)<<17,A<128)||(A=v[h.pos++],S|=(A&127)<<24,A<128)||(A=v[h.pos++],S|=(A&1)<<31,A<128))return c(t,S,o);throw new Error("Expected varint not more than 10 bytes")}function p(t){return t.type===n.Bytes?t.readVarint()+t.pos:t.pos+1}function c(t,o,h){return h?o*4294967296+(t>>>0):(o>>>0)*4294967296+(t>>>0)}function g(t,o){var h,v;if(t>=0?(h=t%4294967296|0,v=t/4294967296|0):(h=~(-t%4294967296),v=~(-t/4294967296),h^4294967295?h=h+1|0:(h=0,v=v+1|0)),t>=18446744073709552e3||t<-18446744073709552e3)throw new Error("Given varint doesn't fit into 10 bytes");o.realloc(10),y(h,v,o),x(v,o)}function y(t,o,h){h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos++]=t&127|128,t>>>=7,h.buf[h.pos]=t&127}function x(t,o){var h=(t&7)<<4;o.buf[o.pos++]|=h|((t>>>=3)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127|((t>>>=7)?128:0),t&&(o.buf[o.pos++]=t&127)))))}function u(t,o,h){var v=o<=16383?1:o<=2097151?2:o<=268435455?3:Math.floor(Math.log(o)/(Math.LN2*7));h.realloc(v);for(var S=h.pos-1;S>=t;S--)h.buf[S+v]=h.buf[S]}function f(t,o){for(var h=0;h<t.length;h++)o.writeVarint(t[h])}function d(t,o){for(var h=0;h<t.length;h++)o.writeSVarint(t[h])}function w(t,o){for(var h=0;h<t.length;h++)o.writeFloat(t[h])}function M(t,o){for(var h=0;h<t.length;h++)o.writeDouble(t[h])}function m(t,o){for(var h=0;h<t.length;h++)o.writeBoolean(t[h])}function P(t,o){for(var h=0;h<t.length;h++)o.writeFixed32(t[h])}function b(t,o){for(var h=0;h<t.length;h++)o.writeSFixed32(t[h])}function _(t,o){for(var h=0;h<t.length;h++)o.writeFixed64(t[h])}function L(t,o){for(var h=0;h<t.length;h++)o.writeSFixed64(t[h])}function F(t,o){return(t[o]|t[o+1]<<8|t[o+2]<<16)+t[o+3]*16777216}function E(t,o,h){t[h]=o,t[h+1]=o>>>8,t[h+2]=o>>>16,t[h+3]=o>>>24}function k(t,o){return(t[o]|t[o+1]<<8|t[o+2]<<16)+(t[o+3]<<24)}function O(t,o,h){for(var v="",S=o;S<h;){var A=t[S],T=null,V=A>239?4:A>223?3:A>191?2:1;if(S+V>h)break;var B,I,W;V===1?A<128&&(T=A):V===2?(B=t[S+1],(B&192)===128&&(T=(A&31)<<6|B&63,T<=127&&(T=null))):V===3?(B=t[S+1],I=t[S+2],(B&192)===128&&(I&192)===128&&(T=(A&15)<<12|(B&63)<<6|I&63,(T<=2047||T>=55296&&T<=57343)&&(T=null))):V===4&&(B=t[S+1],I=t[S+2],W=t[S+3],(B&192)===128&&(I&192)===128&&(W&192)===128&&(T=(A&15)<<18|(B&63)<<12|(I&63)<<6|W&63,(T<=65535||T>=1114112)&&(T=null))),T===null?(T=65533,V=1):T>65535&&(T-=65536,v+=String.fromCharCode(T>>>10&1023|55296),T=56320|T&1023),v+=String.fromCharCode(T),S+=V}return v}function U(t,o,h){return l.decode(t.subarray(o,h))}function C(t,o,h){for(var v=0,S,A;v<o.length;v++){if(S=o.charCodeAt(v),S>55295&&S<57344)if(A)if(S<56320){t[h++]=239,t[h++]=191,t[h++]=189,A=S;continue}else S=A-55296<<10|S-56320|65536,A=null;else{S>56319||v+1===o.length?(t[h++]=239,t[h++]=191,t[h++]=189):A=S;continue}else A&&(t[h++]=239,t[h++]=191,t[h++]=189,A=null);S<128?t[h++]=S:(S<2048?t[h++]=S>>6|192:(S<65536?t[h++]=S>>12|224:(t[h++]=S>>18|240,t[h++]=S>>12&63|128),t[h++]=S>>6&63|128),t[h++]=S&63|128)}return h}return X}var Y,ln;function wn(){if(ln)return Y;ln=1,Y=r;function r(n,e){this.x=n,this.y=e}return r.prototype={clone:function(){return new r(this.x,this.y)},add:function(n){return this.clone()._add(n)},sub:function(n){return this.clone()._sub(n)},multByPoint:function(n){return this.clone()._multByPoint(n)},divByPoint:function(n){return this.clone()._divByPoint(n)},mult:function(n){return this.clone()._mult(n)},div:function(n){return this.clone()._div(n)},rotate:function(n){return this.clone()._rotate(n)},rotateAround:function(n,e){return this.clone()._rotateAround(n,e)},matMult:function(n){return this.clone()._matMult(n)},unit:function(){return this.clone()._unit()},perp:function(){return this.clone()._perp()},round:function(){return this.clone()._round()},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals:function(n){return this.x===n.x&&this.y===n.y},dist:function(n){return Math.sqrt(this.distSqr(n))},distSqr:function(n){var e=n.x-this.x,s=n.y-this.y;return e*e+s*s},angle:function(){return Math.atan2(this.y,this.x)},angleTo:function(n){return Math.atan2(this.y-n.y,this.x-n.x)},angleWith:function(n){return this.angleWithSep(n.x,n.y)},angleWithSep:function(n,e){return Math.atan2(this.x*e-this.y*n,this.x*n+this.y*e)},_matMult:function(n){var e=n[0]*this.x+n[1]*this.y,s=n[2]*this.x+n[3]*this.y;return this.x=e,this.y=s,this},_add:function(n){return this.x+=n.x,this.y+=n.y,this},_sub:function(n){return this.x-=n.x,this.y-=n.y,this},_mult:function(n){return this.x*=n,this.y*=n,this},_div:function(n){return this.x/=n,this.y/=n,this},_multByPoint:function(n){return this.x*=n.x,this.y*=n.y,this},_divByPoint:function(n){return this.x/=n.x,this.y/=n.y,this},_unit:function(){return this._div(this.mag()),this},_perp:function(){var n=this.y;return this.y=this.x,this.x=-n,this},_rotate:function(n){var e=Math.cos(n),s=Math.sin(n),i=e*this.x-s*this.y,l=s*this.x+e*this.y;return this.x=i,this.y=l,this},_rotateAround:function(n,e){var s=Math.cos(n),i=Math.sin(n),l=e.x+s*(this.x-e.x)-i*(this.y-e.y),a=e.y+i*(this.x-e.x)+s*(this.y-e.y);return this.x=l,this.y=a,this},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},r.convert=function(n){return n instanceof r?n:Array.isArray(n)?new r(n[0],n[1]):n},Y}var j={},Z,hn;function mn(){if(hn)return Z;hn=1;var r=wn();Z=n;function n(a,p,c,g,y){this.properties={},this.extent=c,this.type=0,this._pbf=a,this._geometry=-1,this._keys=g,this._values=y,a.readFields(e,this,p)}function e(a,p,c){a==1?p.id=c.readVarint():a==2?s(c,p):a==3?p.type=c.readVarint():a==4&&(p._geometry=c.pos)}function s(a,p){for(var c=a.readVarint()+a.pos;a.pos<c;){var g=p._keys[a.readVarint()],y=p._values[a.readVarint()];p.properties[g]=y}}n.types=["Unknown","Point","LineString","Polygon"],n.prototype.loadGeometry=function(){var a=this._pbf;a.pos=this._geometry;for(var p=a.readVarint()+a.pos,c=1,g=0,y=0,x=0,u=[],f;a.pos<p;){if(g<=0){var d=a.readVarint();c=d&7,g=d>>3}if(g--,c===1||c===2)y+=a.readSVarint(),x+=a.readSVarint(),c===1&&(f&&u.push(f),f=[]),f.push(new r(y,x));else if(c===7)f&&f.push(f[0].clone());else throw new Error("unknown command "+c)}return f&&u.push(f),u},n.prototype.bbox=function(){var a=this._pbf;a.pos=this._geometry;for(var p=a.readVarint()+a.pos,c=1,g=0,y=0,x=0,u=1/0,f=-1/0,d=1/0,w=-1/0;a.pos<p;){if(g<=0){var M=a.readVarint();c=M&7,g=M>>3}if(g--,c===1||c===2)y+=a.readSVarint(),x+=a.readSVarint(),y<u&&(u=y),y>f&&(f=y),x<d&&(d=x),x>w&&(w=x);else if(c!==7)throw new Error("unknown command "+c)}return[u,d,f,w]},n.prototype.toGeoJSON=function(a,p,c){var g=this.extent*Math.pow(2,c),y=this.extent*a,x=this.extent*p,u=this.loadGeometry(),f=n.types[this.type],d,w;function M(b){for(var _=0;_<b.length;_++){var L=b[_],F=180-(L.y+x)*360/g;b[_]=[(L.x+y)*360/g-180,360/Math.PI*Math.atan(Math.exp(F*Math.PI/180))-90]}}switch(this.type){case 1:var m=[];for(d=0;d<u.length;d++)m[d]=u[d][0];u=m,M(u);break;case 2:for(d=0;d<u.length;d++)M(u[d]);break;case 3:for(u=i(u),d=0;d<u.length;d++)for(w=0;w<u[d].length;w++)M(u[d][w]);break}u.length===1?u=u[0]:f="Multi"+f;var P={type:"Feature",geometry:{type:f,coordinates:u},properties:this.properties};return"id"in this&&(P.id=this.id),P};function i(a){var p=a.length;if(p<=1)return[a];for(var c=[],g,y,x=0;x<p;x++){var u=l(a[x]);u!==0&&(y===void 0&&(y=u<0),y===u<0?(g&&c.push(g),g=[a[x]]):g.push(a[x]))}return g&&c.push(g),c}function l(a){for(var p=0,c=0,g=a.length,y=g-1,x,u;c<g;y=c++)x=a[c],u=a[y],p+=(u.x-x.x)*(x.y+u.y);return p}return Z}var Q,fn;function bn(){if(fn)return Q;fn=1;var r=mn();Q=n;function n(i,l){this.version=1,this.name=null,this.extent=4096,this.length=0,this._pbf=i,this._keys=[],this._values=[],this._features=[],i.readFields(e,this,l),this.length=this._features.length}function e(i,l,a){i===15?l.version=a.readVarint():i===1?l.name=a.readString():i===5?l.extent=a.readVarint():i===2?l._features.push(a.pos):i===3?l._keys.push(a.readString()):i===4&&l._values.push(s(a))}function s(i){for(var l=null,a=i.readVarint()+i.pos;i.pos<a;){var p=i.readVarint()>>3;l=p===1?i.readString():p===2?i.readFloat():p===3?i.readDouble():p===4?i.readVarint64():p===5?i.readVarint():p===6?i.readSVarint():p===7?i.readBoolean():null}return l}return n.prototype.feature=function(i){if(i<0||i>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[i];var l=this._pbf.readVarint()+this._pbf.pos;return new r(this._pbf,l,this.extent,this._keys,this._values)},Q}var nn,cn;function Zn(){if(cn)return nn;cn=1;var r=bn();nn=n;function n(s,i){this.layers=s.readFields(e,{},i)}function e(s,i,l){if(s===3){var a=new r(l,l.readVarint()+l.pos);a.length&&(i[a.name]=a)}}return nn}var pn;function Qn(){return pn||(pn=1,j.VectorTile=Zn(),j.VectorTileFeature=mn(),j.VectorTileLayer=bn()),j}var en,dn;function ne(){if(dn)return en;dn=1;var r=wn(),n=Qn().VectorTileFeature;en=e;function e(i,l){this.options=l||{},this.features=i,this.length=i.length}e.prototype.feature=function(i){return new s(this.features[i],this.options.extent)};function s(i,l){this.id=typeof i.id=="number"?i.id:void 0,this.type=i.type,this.rawGeometry=i.type===1?[i.geometry]:i.geometry,this.properties=i.tags,this.extent=l||4096}return s.prototype.loadGeometry=function(){var i=this.rawGeometry;this.geometry=[];for(var l=0;l<i.length;l++){for(var a=i[l],p=[],c=0;c<a.length;c++)p.push(new r(a[c][0],a[c][1]));this.geometry.push(p)}return this.geometry},s.prototype.bbox=function(){this.geometry||this.loadGeometry();for(var i=this.geometry,l=1/0,a=-1/0,p=1/0,c=-1/0,g=0;g<i.length;g++)for(var y=i[g],x=0;x<y.length;x++){var u=y[x];l=Math.min(l,u.x),a=Math.max(a,u.x),p=Math.min(p,u.y),c=Math.max(c,u.y)}return[l,p,a,c]},s.prototype.toGeoJSON=n.prototype.toGeoJSON,en}var gn;function ee(){if(gn)return G.exports;gn=1;var r=Yn(),n=ne();G.exports=e,G.exports.fromVectorTileJs=e,G.exports.fromGeojsonVt=s,G.exports.GeoJSONWrapper=n;function e(u){var f=new r;return i(u,f),f.finish()}function s(u,f){f=f||{};var d={};for(var w in u)d[w]=new n(u[w].features,f),d[w].name=w,d[w].version=f.version,d[w].extent=f.extent;return e({layers:d})}function i(u,f){for(var d in u.layers)f.writeMessage(3,l,u.layers[d])}function l(u,f){f.writeVarintField(15,u.version||1),f.writeStringField(1,u.name||""),f.writeVarintField(5,u.extent||4096);var d,w={keys:[],values:[],keycache:{},valuecache:{}};for(d=0;d<u.length;d++)w.feature=u.feature(d),f.writeMessage(2,a,w);var M=w.keys;for(d=0;d<M.length;d++)f.writeStringField(3,M[d]);var m=w.values;for(d=0;d<m.length;d++)f.writeMessage(4,x,m[d])}function a(u,f){var d=u.feature;d.id!==void 0&&f.writeVarintField(1,d.id),f.writeMessage(2,p,u),f.writeVarintField(3,d.type),f.writeMessage(4,y,d)}function p(u,f){var d=u.feature,w=u.keys,M=u.values,m=u.keycache,P=u.valuecache;for(var b in d.properties){var _=d.properties[b],L=m[b];if(_!==null){typeof L>"u"&&(w.push(b),L=w.length-1,m[b]=L),f.writeVarint(L);var F=typeof _;F!=="string"&&F!=="boolean"&&F!=="number"&&(_=JSON.stringify(_));var E=F+":"+_,k=P[E];typeof k>"u"&&(M.push(_),k=M.length-1,P[E]=k),f.writeVarint(k)}}}function c(u,f){return(f<<3)+(u&7)}function g(u){return u<<1^u>>31}function y(u,f){for(var d=u.loadGeometry(),w=u.type,M=0,m=0,P=d.length,b=0;b<P;b++){var _=d[b],L=1;w===1&&(L=_.length),f.writeVarint(c(1,L));for(var F=w===3?_.length-1:_.length,E=0;E<F;E++){E===1&&w!==1&&f.writeVarint(c(2,F-1));var k=_[E].x-M,O=_[E].y-m;f.writeVarint(g(k)),f.writeVarint(g(O)),M+=k,m+=O}w===3&&f.writeVarint(c(7,1))}}function x(u,f){var d=typeof u;d==="string"?f.writeStringField(1,u):d==="boolean"?f.writeBooleanField(7,u):d==="number"&&(u%1!==0?f.writeDoubleField(3,u):u<0?f.writeSVarintField(6,u):f.writeVarintField(5,u))}return G.exports}var te=ee();const re=Jn(te),vn=`var $t = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Ye = Math.ceil, re = Math.floor, Q = "[BigNumber Error] ", ct = Q + "Number primitive has more than 15 significant digits: ", se = 1e14, G = 14, Je = 9007199254740991, We = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], ye = 1e7, X = 1e9;
function kt(t) {
  var e, r, n, i = m.prototype = { constructor: m, toString: null, valueOf: null }, o = new m(1), l = 20, a = 4, h = -7, c = 21, P = -1e7, d = 1e7, L = !1, A = 1, M = 0, b = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, T = "0123456789abcdefghijklmnopqrstuvwxyz", O = !0;
  function m(s, u) {
    var f, x, p, y, v, g, w, S, E = this;
    if (!(E instanceof m)) return new m(s, u);
    if (u == null) {
      if (s && s._isBigNumber === !0) {
        E.s = s.s, !s.c || s.e > d ? E.c = E.e = null : s.e < P ? E.c = [E.e = 0] : (E.e = s.e, E.c = s.c.slice());
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
        if (!$t.test(S = String(s))) return n(E, S, g);
        E.s = S.charCodeAt(0) == 45 ? (S = S.slice(1), -1) : 1;
      }
      (y = S.indexOf(".")) > -1 && (S = S.replace(".", "")), (v = S.search(/e/i)) > 0 ? (y < 0 && (y = v), y += +S.slice(v + 1), S = S.substring(0, v)) : y < 0 && (y = S.length);
    } else {
      if (U(u, 2, T.length, "Base"), u == 10 && O)
        return E = new m(s), N(E, l + E.e + 1, a);
      if (S = String(s), g = typeof s == "number") {
        if (s * 0 != 0) return n(E, S, g, u);
        if (E.s = 1 / s < 0 ? (S = S.slice(1), -1) : 1, m.DEBUG && S.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(ct + s);
      } else
        E.s = S.charCodeAt(0) === 45 ? (S = S.slice(1), -1) : 1;
      for (f = T.slice(0, u), y = v = 0, w = S.length; v < w; v++)
        if (f.indexOf(x = S.charAt(v)) < 0) {
          if (x == ".") {
            if (v > y) {
              y = w;
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
    for (w = S.length; S.charCodeAt(--w) === 48; ) ;
    if (S = S.slice(v, ++w)) {
      if (w -= v, g && m.DEBUG && w > 15 && (s > Je || s !== re(s)))
        throw Error(ct + E.s * s);
      if ((y = y - v - 1) > d)
        E.c = E.e = null;
      else if (y < P)
        E.c = [E.e = 0];
      else {
        if (E.e = y, E.c = [], v = (y + 1) % G, y < 0 && (v += G), v < w) {
          for (v && E.c.push(+S.slice(0, v)), w -= G; v < w; )
            E.c.push(+S.slice(v, v += G));
          v = G - (S = S.slice(v)).length;
        } else
          v -= w;
        for (; v--; S += "0") ;
        E.c.push(+S);
      }
    } else
      E.c = [E.e = 0];
  }
  m.clone = kt, m.ROUND_UP = 0, m.ROUND_DOWN = 1, m.ROUND_CEIL = 2, m.ROUND_FLOOR = 3, m.ROUND_HALF_UP = 4, m.ROUND_HALF_DOWN = 5, m.ROUND_HALF_EVEN = 6, m.ROUND_HALF_CEIL = 7, m.ROUND_HALF_FLOOR = 8, m.EUCLID = 9, m.config = m.set = function(s) {
    var u, f;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(u = "DECIMAL_PLACES") && (f = s[u], U(f, 0, X, u), l = f), s.hasOwnProperty(u = "ROUNDING_MODE") && (f = s[u], U(f, 0, 8, u), a = f), s.hasOwnProperty(u = "EXPONENTIAL_AT") && (f = s[u], f && f.pop ? (U(f[0], -X, 0, u), U(f[1], 0, X, u), h = f[0], c = f[1]) : (U(f, -X, X, u), h = -(c = f < 0 ? -f : f))), s.hasOwnProperty(u = "RANGE"))
          if (f = s[u], f && f.pop)
            U(f[0], -X, -1, u), U(f[1], 1, X, u), P = f[0], d = f[1];
          else if (U(f, -X, X, u), f)
            P = -(d = f < 0 ? -f : f);
          else
            throw Error(Q + u + " cannot be zero: " + f);
        if (s.hasOwnProperty(u = "CRYPTO"))
          if (f = s[u], f === !!f)
            if (f)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                L = f;
              else
                throw L = !f, Error(Q + "crypto unavailable");
            else
              L = f;
          else
            throw Error(Q + u + " not true or false: " + f);
        if (s.hasOwnProperty(u = "MODULO_MODE") && (f = s[u], U(f, 0, 9, u), A = f), s.hasOwnProperty(u = "POW_PRECISION") && (f = s[u], U(f, 0, X, u), M = f), s.hasOwnProperty(u = "FORMAT"))
          if (f = s[u], typeof f == "object") b = f;
          else throw Error(Q + u + " not an object: " + f);
        if (s.hasOwnProperty(u = "ALPHABET"))
          if (f = s[u], typeof f == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(f))
            O = f.slice(0, 10) == "0123456789", T = f;
          else
            throw Error(Q + u + " invalid: " + f);
      } else
        throw Error(Q + "Object expected: " + s);
    return {
      DECIMAL_PLACES: l,
      ROUNDING_MODE: a,
      EXPONENTIAL_AT: [h, c],
      RANGE: [P, d],
      CRYPTO: L,
      MODULO_MODE: A,
      POW_PRECISION: M,
      FORMAT: b,
      ALPHABET: T
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
    return B(arguments, -1);
  }, m.minimum = m.min = function() {
    return B(arguments, 1);
  }, m.random = (function() {
    var s = 9007199254740992, u = Math.random() * s & 2097151 ? function() {
      return re(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(f) {
      var x, p, y, v, g, w = 0, S = [], E = new m(o);
      if (f == null ? f = l : U(f, 0, X), v = Ye(f / G), L)
        if (crypto.getRandomValues) {
          for (x = crypto.getRandomValues(new Uint32Array(v *= 2)); w < v; )
            g = x[w] * 131072 + (x[w + 1] >>> 11), g >= 9e15 ? (p = crypto.getRandomValues(new Uint32Array(2)), x[w] = p[0], x[w + 1] = p[1]) : (S.push(g % 1e14), w += 2);
          w = v / 2;
        } else if (crypto.randomBytes) {
          for (x = crypto.randomBytes(v *= 7); w < v; )
            g = (x[w] & 31) * 281474976710656 + x[w + 1] * 1099511627776 + x[w + 2] * 4294967296 + x[w + 3] * 16777216 + (x[w + 4] << 16) + (x[w + 5] << 8) + x[w + 6], g >= 9e15 ? crypto.randomBytes(7).copy(x, w) : (S.push(g % 1e14), w += 7);
          w = v / 7;
        } else
          throw L = !1, Error(Q + "crypto unavailable");
      if (!L)
        for (; w < v; )
          g = u(), g < 9e15 && (S[w++] = g % 1e14);
      for (v = S[--w], f %= G, v && f && (g = We[G - f], S[w] = re(v / g) * g); S[w] === 0; S.pop(), w--) ;
      if (w < 0)
        S = [y = 0];
      else {
        for (y = -1; S[0] === 0; S.splice(0, 1), y -= G) ;
        for (w = 1, g = S[0]; g >= 10; g /= 10, w++) ;
        w < G && (y -= G - w);
      }
      return E.e = y, E.c = S, E;
    };
  })(), m.sum = function() {
    for (var s = 1, u = arguments, f = new m(u[0]); s < u.length; ) f = f.plus(u[s++]);
    return f;
  }, r = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function u(f, x, p, y) {
      for (var v, g = [0], w, S = 0, E = f.length; S < E; ) {
        for (w = g.length; w--; g[w] *= x) ;
        for (g[0] += y.indexOf(f.charAt(S++)), v = 0; v < g.length; v++)
          g[v] > p - 1 && (g[v + 1] == null && (g[v + 1] = 0), g[v + 1] += g[v] / p | 0, g[v] %= p);
      }
      return g.reverse();
    }
    return function(f, x, p, y, v) {
      var g, w, S, E, _, F, I, D, V = f.indexOf("."), K = l, q = a;
      for (V >= 0 && (E = M, M = 0, f = f.replace(".", ""), D = new m(x), F = D.pow(f.length - V), M = E, D.c = u(
        ce(te(F.c), F.e, "0"),
        10,
        p,
        s
      ), D.e = D.c.length), I = u(f, x, p, v ? (g = T, s) : (g = s, T)), S = E = I.length; I[--E] == 0; I.pop()) ;
      if (!I[0]) return g.charAt(0);
      if (V < 0 ? --S : (F.c = I, F.e = S, F.s = y, F = e(F, D, K, q, p), I = F.c, _ = F.r, S = F.e), w = S + K + 1, V = I[w], E = p / 2, _ = _ || w < 0 || I[w + 1] != null, _ = q < 4 ? (V != null || _) && (q == 0 || q == (F.s < 0 ? 3 : 2)) : V > E || V == E && (q == 4 || _ || q == 6 && I[w - 1] & 1 || q == (F.s < 0 ? 8 : 7)), w < 1 || !I[0])
        f = _ ? ce(g.charAt(1), -K, g.charAt(0)) : g.charAt(0);
      else {
        if (I.length = w, _)
          for (--p; ++I[--w] > p; )
            I[w] = 0, w || (++S, I = [1].concat(I));
        for (E = I.length; !I[--E]; ) ;
        for (V = 0, f = ""; V <= E; f += g.charAt(I[V++])) ;
        f = ce(f, S, g.charAt(0));
      }
      return f;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(x, p, y) {
      var v, g, w, S, E = 0, _ = x.length, F = p % ye, I = p / ye | 0;
      for (x = x.slice(); _--; )
        w = x[_] % ye, S = x[_] / ye | 0, v = I * w + S * F, g = F * w + v % ye * ye + E, E = (g / y | 0) + (v / ye | 0) + I * S, x[_] = g % y;
      return E && (x = [E].concat(x)), x;
    }
    function u(x, p, y, v) {
      var g, w;
      if (y != v)
        w = y > v ? 1 : -1;
      else
        for (g = w = 0; g < y; g++)
          if (x[g] != p[g]) {
            w = x[g] > p[g] ? 1 : -1;
            break;
          }
      return w;
    }
    function f(x, p, y, v) {
      for (var g = 0; y--; )
        x[y] -= g, g = x[y] < p[y] ? 1 : 0, x[y] = g * v + x[y] - p[y];
      for (; !x[0] && x.length > 1; x.splice(0, 1)) ;
    }
    return function(x, p, y, v, g) {
      var w, S, E, _, F, I, D, V, K, q, H, Y, Te, Ke, Xe, le, be, ee = x.s == p.s ? 1 : -1, W = x.c, $ = p.c;
      if (!W || !W[0] || !$ || !$[0])
        return new m(
          // Return NaN if either NaN, or both Infinity or 0.
          !x.s || !p.s || (W ? $ && W[0] == $[0] : !$) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            W && W[0] == 0 || !$ ? ee * 0 : ee / 0
          )
        );
      for (V = new m(ee), K = V.c = [], S = x.e - p.e, ee = y + S + 1, g || (g = se, S = ne(x.e / G) - ne(p.e / G), ee = ee / G | 0), E = 0; $[E] == (W[E] || 0); E++) ;
      if ($[E] > (W[E] || 0) && S--, ee < 0)
        K.push(1), _ = !0;
      else {
        for (Ke = W.length, le = $.length, E = 0, ee += 2, F = re(g / ($[0] + 1)), F > 1 && ($ = s($, F, g), W = s(W, F, g), le = $.length, Ke = W.length), Te = le, q = W.slice(0, le), H = q.length; H < le; q[H++] = 0) ;
        be = $.slice(), be = [0].concat(be), Xe = $[0], $[1] >= g / 2 && Xe++;
        do {
          if (F = 0, w = u($, q, le, H), w < 0) {
            if (Y = q[0], le != H && (Y = Y * g + (q[1] || 0)), F = re(Y / Xe), F > 1)
              for (F >= g && (F = g - 1), I = s($, F, g), D = I.length, H = q.length; u(I, q, D, H) == 1; )
                F--, f(I, le < D ? be : $, D, g), D = I.length, w = 1;
            else
              F == 0 && (w = F = 1), I = $.slice(), D = I.length;
            if (D < H && (I = [0].concat(I)), f(q, I, H, g), H = q.length, w == -1)
              for (; u($, q, le, H) < 1; )
                F++, f(q, le < H ? be : $, H, g), H = q.length;
          } else w === 0 && (F++, q = [0]);
          K[E++] = F, q[0] ? q[H++] = W[Te] || 0 : (q = [W[Te]], H = 1);
        } while ((Te++ < Ke || q[0] != null) && ee--);
        _ = q[0] != null, K[0] || K.splice(0, 1);
      }
      if (g == se) {
        for (E = 1, ee = K[0]; ee >= 10; ee /= 10, E++) ;
        N(V, y + (V.e = E + S * G - 1) + 1, v, _);
      } else
        V.e = S, V.r = +_;
      return V;
    };
  })();
  function R(s, u, f, x) {
    var p, y, v, g, w;
    if (f == null ? f = a : U(f, 0, 8), !s.c) return s.toString();
    if (p = s.c[0], v = s.e, u == null)
      w = te(s.c), w = x == 1 || x == 2 && (v <= h || v >= c) ? Re(w, v) : ce(w, v, "0");
    else if (s = N(new m(s), u, f), y = s.e, w = te(s.c), g = w.length, x == 1 || x == 2 && (u <= y || y <= h)) {
      for (; g < u; w += "0", g++) ;
      w = Re(w, y);
    } else if (u -= v + (x === 2 && y > v), w = ce(w, y, "0"), y + 1 > g) {
      if (--u > 0) for (w += "."; u--; w += "0") ;
    } else if (u += y - g, u > 0)
      for (y + 1 == g && (w += "."); u--; w += "0") ;
    return s.s < 0 && p ? "-" + w : w;
  }
  function B(s, u) {
    for (var f, x, p = 1, y = new m(s[0]); p < s.length; p++)
      x = new m(s[p]), (!x.s || (f = de(y, x)) === u || f === 0 && y.s === u) && (y = x);
    return y;
  }
  function C(s, u, f) {
    for (var x = 1, p = u.length; !u[--p]; u.pop()) ;
    for (p = u[0]; p >= 10; p /= 10, x++) ;
    return (f = x + f * G - 1) > d ? s.c = s.e = null : f < P ? s.c = [s.e = 0] : (s.e = f, s.c = u), s;
  }
  n = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, u = /^([^.]+)\\.$/, f = /^\\.([^.]+)$/, x = /^-?(Infinity|NaN)$/, p = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(y, v, g, w) {
      var S, E = g ? v : v.replace(p, "");
      if (x.test(E))
        y.s = isNaN(E) ? null : E < 0 ? -1 : 1;
      else {
        if (!g && (E = E.replace(s, function(_, F, I) {
          return S = (I = I.toLowerCase()) == "x" ? 16 : I == "b" ? 2 : 8, !w || w == S ? F : _;
        }), w && (S = w, E = E.replace(u, "$1").replace(f, "0.$1")), v != E))
          return new m(E, S);
        if (m.DEBUG)
          throw Error(Q + "Not a" + (w ? " base " + w : "") + " number: " + v);
        y.s = null;
      }
      y.c = y.e = null;
    };
  })();
  function N(s, u, f, x) {
    var p, y, v, g, w, S, E, _ = s.c, F = We;
    if (_) {
      e: {
        for (p = 1, g = _[0]; g >= 10; g /= 10, p++) ;
        if (y = u - p, y < 0)
          y += G, v = u, w = _[S = 0], E = re(w / F[p - v - 1] % 10);
        else if (S = Ye((y + 1) / G), S >= _.length)
          if (x) {
            for (; _.length <= S; _.push(0)) ;
            w = E = 0, p = 1, y %= G, v = y - G + 1;
          } else
            break e;
        else {
          for (w = g = _[S], p = 1; g >= 10; g /= 10, p++) ;
          y %= G, v = y - G + p, E = v < 0 ? 0 : re(w / F[p - v - 1] % 10);
        }
        if (x = x || u < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        _[S + 1] != null || (v < 0 ? w : w % F[p - v - 1]), x = f < 4 ? (E || x) && (f == 0 || f == (s.s < 0 ? 3 : 2)) : E > 5 || E == 5 && (f == 4 || x || f == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? v > 0 ? w / F[p - v] : 0 : _[S - 1]) % 10 & 1 || f == (s.s < 0 ? 8 : 7)), u < 1 || !_[0])
          return _.length = 0, x ? (u -= s.e + 1, _[0] = F[(G - u % G) % G], s.e = -u || 0) : _[0] = s.e = 0, s;
        if (y == 0 ? (_.length = S, g = 1, S--) : (_.length = S + 1, g = F[G - y], _[S] = v > 0 ? re(w / F[p - v] % F[v]) * g : 0), x)
          for (; ; )
            if (S == 0) {
              for (y = 1, v = _[0]; v >= 10; v /= 10, y++) ;
              for (v = _[0] += g, g = 1; v >= 10; v /= 10, g++) ;
              y != g && (s.e++, _[0] == se && (_[0] = 1));
              break;
            } else {
              if (_[S] += g, _[S] != se) break;
              _[S--] = 0, g = 1;
            }
        for (y = _.length; _[--y] === 0; _.pop()) ;
      }
      s.e > d ? s.c = s.e = null : s.e < P && (s.c = [s.e = 0]);
    }
    return s;
  }
  function k(s) {
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
      return U(s, 0, X), u == null ? u = a : U(u, 0, 8), N(new m(y), s + y.e + 1, u);
    if (!(f = y.c)) return null;
    if (x = ((p = f.length - 1) - ne(this.e / G)) * G, p = f[p]) for (; p % 10 == 0; p /= 10, x--) ;
    return x < 0 && (x = 0), x;
  }, i.dividedBy = i.div = function(s, u) {
    return e(this, new m(s, u), l, a);
  }, i.dividedToIntegerBy = i.idiv = function(s, u) {
    return e(this, new m(s, u), 0, 1);
  }, i.exponentiatedBy = i.pow = function(s, u) {
    var f, x, p, y, v, g, w, S, E, _ = this;
    if (s = new m(s), s.c && !s.isInteger())
      throw Error(Q + "Exponent not an integer: " + k(s));
    if (u != null && (u = new m(u)), g = s.e > 14, !_.c || !_.c[0] || _.c[0] == 1 && !_.e && _.c.length == 1 || !s.c || !s.c[0])
      return E = new m(Math.pow(+k(_), g ? s.s * (2 - Ce(s)) : +k(s))), u ? E.mod(u) : E;
    if (w = s.s < 0, u) {
      if (u.c ? !u.c[0] : !u.s) return new m(NaN);
      x = !w && _.isInteger() && u.isInteger(), x && (_ = _.mod(u));
    } else {
      if (s.e > 9 && (_.e > 0 || _.e < -1 || (_.e == 0 ? _.c[0] > 1 || g && _.c[1] >= 24e7 : _.c[0] < 8e13 || g && _.c[0] <= 9999975e7)))
        return y = _.s < 0 && Ce(s) ? -0 : 0, _.e > -1 && (y = 1 / y), new m(w ? 1 / y : y);
      M && (y = Ye(M / G + 2));
    }
    for (g ? (f = new m(0.5), w && (s.s = 1), S = Ce(s)) : (p = Math.abs(+k(s)), S = p % 2), E = new m(o); ; ) {
      if (S) {
        if (E = E.times(_), !E.c) break;
        y ? E.c.length > y && (E.c.length = y) : x && (E = E.mod(u));
      }
      if (p) {
        if (p = re(p / 2), p === 0) break;
        S = p % 2;
      } else if (s = s.times(f), N(s, s.e + 1, 1), s.e > 14)
        S = Ce(s);
      else {
        if (p = +k(s), p === 0) break;
        S = p % 2;
      }
      _ = _.times(_), y ? _.c && _.c.length > y && (_.c.length = y) : x && (_ = _.mod(u));
    }
    return x ? E : (w && (E = o.div(E)), u ? E.mod(u) : y ? N(E, M, a, v) : E);
  }, i.integerValue = function(s) {
    var u = new m(this);
    return s == null ? s = a : U(s, 0, 8), N(u, u.e + 1, s);
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
    var f, x, p, y, v = this, g = v.s;
    if (s = new m(s, u), u = s.s, !g || !u) return new m(NaN);
    if (g != u)
      return s.s = -u, v.plus(s);
    var w = v.e / G, S = s.e / G, E = v.c, _ = s.c;
    if (!w || !S) {
      if (!E || !_) return E ? (s.s = -u, s) : new m(_ ? v : NaN);
      if (!E[0] || !_[0])
        return _[0] ? (s.s = -u, s) : new m(E[0] ? v : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          a == 3 ? -0 : 0
        ));
    }
    if (w = ne(w), S = ne(S), E = E.slice(), g = w - S) {
      for ((y = g < 0) ? (g = -g, p = E) : (S = w, p = _), p.reverse(), u = g; u--; p.push(0)) ;
      p.reverse();
    } else
      for (x = (y = (g = E.length) < (u = _.length)) ? g : u, g = u = 0; u < x; u++)
        if (E[u] != _[u]) {
          y = E[u] < _[u];
          break;
        }
    if (y && (p = E, E = _, _ = p, s.s = -s.s), u = (x = _.length) - (f = E.length), u > 0) for (; u--; E[f++] = 0) ;
    for (u = se - 1; x > g; ) {
      if (E[--x] < _[x]) {
        for (f = x; f && !E[--f]; E[f] = u) ;
        --E[f], E[x] += se;
      }
      E[x] -= _[x];
    }
    for (; E[0] == 0; E.splice(0, 1), --S) ;
    return E[0] ? C(s, E, S) : (s.s = a == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, i.modulo = i.mod = function(s, u) {
    var f, x, p = this;
    return s = new m(s, u), !p.c || !s.s || s.c && !s.c[0] ? new m(NaN) : !s.c || p.c && !p.c[0] ? new m(p) : (A == 9 ? (x = s.s, s.s = 1, f = e(p, s, 0, 3), s.s = x, f.s *= x) : f = e(p, s, 0, A), s = p.minus(f.times(s)), !s.c[0] && A == 1 && (s.s = p.s), s);
  }, i.multipliedBy = i.times = function(s, u) {
    var f, x, p, y, v, g, w, S, E, _, F, I, D, V, K, q = this, H = q.c, Y = (s = new m(s, u)).c;
    if (!H || !Y || !H[0] || !Y[0])
      return !q.s || !s.s || H && !H[0] && !Y || Y && !Y[0] && !H ? s.c = s.e = s.s = null : (s.s *= q.s, !H || !Y ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (x = ne(q.e / G) + ne(s.e / G), s.s *= q.s, w = H.length, _ = Y.length, w < _ && (D = H, H = Y, Y = D, p = w, w = _, _ = p), p = w + _, D = []; p--; D.push(0)) ;
    for (V = se, K = ye, p = _; --p >= 0; ) {
      for (f = 0, F = Y[p] % K, I = Y[p] / K | 0, v = w, y = p + v; y > p; )
        S = H[--v] % K, E = H[v] / K | 0, g = I * S + E * F, S = F * S + g % K * K + D[y] + f, f = (S / V | 0) + (g / K | 0) + I * E, D[y--] = S % V;
      D[y] = f;
    }
    return f ? ++x : D.splice(0, 1), C(s, D, x);
  }, i.negated = function() {
    var s = new m(this);
    return s.s = -s.s || null, s;
  }, i.plus = function(s, u) {
    var f, x = this, p = x.s;
    if (s = new m(s, u), u = s.s, !p || !u) return new m(NaN);
    if (p != u)
      return s.s = -u, x.minus(s);
    var y = x.e / G, v = s.e / G, g = x.c, w = s.c;
    if (!y || !v) {
      if (!g || !w) return new m(p / 0);
      if (!g[0] || !w[0]) return w[0] ? s : new m(g[0] ? x : p * 0);
    }
    if (y = ne(y), v = ne(v), g = g.slice(), p = y - v) {
      for (p > 0 ? (v = y, f = w) : (p = -p, f = g), f.reverse(); p--; f.push(0)) ;
      f.reverse();
    }
    for (p = g.length, u = w.length, p - u < 0 && (f = w, w = g, g = f, u = p), p = 0; u; )
      p = (g[--u] = g[u] + w[u] + p) / se | 0, g[u] = se === g[u] ? 0 : g[u] % se;
    return p && (g = [p].concat(g), ++v), C(s, g, v);
  }, i.precision = i.sd = function(s, u) {
    var f, x, p, y = this;
    if (s != null && s !== !!s)
      return U(s, 1, X), u == null ? u = a : U(u, 0, 8), N(new m(y), s, u);
    if (!(f = y.c)) return null;
    if (p = f.length - 1, x = p * G + 1, p = f[p]) {
      for (; p % 10 == 0; p /= 10, x--) ;
      for (p = f[0]; p >= 10; p /= 10, x++) ;
    }
    return s && y.e + 1 > x && (x = y.e + 1), x;
  }, i.shiftedBy = function(s) {
    return U(s, -Je, Je), this.times("1e" + s);
  }, i.squareRoot = i.sqrt = function() {
    var s, u, f, x, p, y = this, v = y.c, g = y.s, w = y.e, S = l + 4, E = new m("0.5");
    if (g !== 1 || !v || !v[0])
      return new m(!g || g < 0 && (!v || v[0]) ? NaN : v ? y : 1 / 0);
    if (g = Math.sqrt(+k(y)), g == 0 || g == 1 / 0 ? (u = te(v), (u.length + w) % 2 == 0 && (u += "0"), g = Math.sqrt(+u), w = ne((w + 1) / 2) - (w < 0 || w % 2), g == 1 / 0 ? u = "5e" + w : (u = g.toExponential(), u = u.slice(0, u.indexOf("e") + 1) + w), f = new m(u)) : f = new m(g + ""), f.c[0]) {
      for (w = f.e, g = w + S, g < 3 && (g = 0); ; )
        if (p = f, f = E.times(p.plus(e(y, p, S, 1))), te(p.c).slice(0, g) === (u = te(f.c)).slice(0, g))
          if (f.e < w && --g, u = u.slice(g - 3, g + 1), u == "9999" || !x && u == "4999") {
            if (!x && (N(p, p.e + l + 2, 0), p.times(p).eq(y))) {
              f = p;
              break;
            }
            S += 4, g += 4, x = 1;
          } else {
            (!+u || !+u.slice(1) && u.charAt(0) == "5") && (N(f, f.e + l + 2, 1), s = !f.times(f).eq(y));
            break;
          }
    }
    return N(f, f.e + l + 1, a, s);
  }, i.toExponential = function(s, u) {
    return s != null && (U(s, 0, X), s++), R(this, s, u, 1);
  }, i.toFixed = function(s, u) {
    return s != null && (U(s, 0, X), s = s + this.e + 1), R(this, s, u);
  }, i.toFormat = function(s, u, f) {
    var x, p = this;
    if (f == null)
      s != null && u && typeof u == "object" ? (f = u, u = null) : s && typeof s == "object" ? (f = s, s = u = null) : f = b;
    else if (typeof f != "object")
      throw Error(Q + "Argument not an object: " + f);
    if (x = p.toFixed(s, u), p.c) {
      var y, v = x.split("."), g = +f.groupSize, w = +f.secondaryGroupSize, S = f.groupSeparator || "", E = v[0], _ = v[1], F = p.s < 0, I = F ? E.slice(1) : E, D = I.length;
      if (w && (y = g, g = w, w = y, D -= y), g > 0 && D > 0) {
        for (y = D % g || g, E = I.substr(0, y); y < D; y += g) E += S + I.substr(y, g);
        w > 0 && (E += S + I.slice(y)), F && (E = "-" + E);
      }
      x = _ ? E + (f.decimalSeparator || "") + ((w = +f.fractionGroupSize) ? _.replace(
        new RegExp("\\\\d{" + w + "}\\\\B", "g"),
        "$&" + (f.fractionGroupSeparator || "")
      ) : _) : E;
    }
    return (f.prefix || "") + x + (f.suffix || "");
  }, i.toFraction = function(s) {
    var u, f, x, p, y, v, g, w, S, E, _, F, I = this, D = I.c;
    if (s != null && (g = new m(s), !g.isInteger() && (g.c || g.s !== 1) || g.lt(o)))
      throw Error(Q + "Argument " + (g.isInteger() ? "out of range: " : "not an integer: ") + k(g));
    if (!D) return new m(I);
    for (u = new m(o), S = f = new m(o), x = w = new m(o), F = te(D), y = u.e = F.length - I.e - 1, u.c[0] = We[(v = y % G) < 0 ? G + v : v], s = !s || g.comparedTo(u) > 0 ? y > 0 ? u : S : g, v = d, d = 1 / 0, g = new m(F), w.c[0] = 0; E = e(g, u, 0, 1), p = f.plus(E.times(x)), p.comparedTo(s) != 1; )
      f = x, x = p, S = w.plus(E.times(p = S)), w = p, u = g.minus(E.times(p = u)), g = p;
    return p = e(s.minus(f), x, 0, 1), w = w.plus(p.times(S)), f = f.plus(p.times(x)), w.s = S.s = I.s, y = y * 2, _ = e(S, x, y, a).minus(I).abs().comparedTo(
      e(w, f, y, a).minus(I).abs()
    ) < 1 ? [S, x] : [w, f], d = v, _;
  }, i.toNumber = function() {
    return +k(this);
  }, i.toPrecision = function(s, u) {
    return s != null && U(s, 1, X), R(this, s, u, 2);
  }, i.toString = function(s) {
    var u, f = this, x = f.s, p = f.e;
    return p === null ? x ? (u = "Infinity", x < 0 && (u = "-" + u)) : u = "NaN" : (s == null ? u = p <= h || p >= c ? Re(te(f.c), p) : ce(te(f.c), p, "0") : s === 10 && O ? (f = N(new m(f), l + p + 1, a), u = ce(te(f.c), f.e, "0")) : (U(s, 2, T.length, "Base"), u = r(ce(te(f.c), p, "0"), 10, s, x, !0)), x < 0 && f.c[0] && (u = "-" + u)), u;
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
var fe = kt(), Kt = class {
  key;
  left = null;
  right = null;
  constructor(t) {
    this.key = t;
  }
}, Ee = class extends Kt {
  constructor(t) {
    super(t);
  }
}, Xt = class {
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
}, qe = class Me extends Xt {
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
    return new Jt(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new Yt(this.wrap());
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
}, Yt = class extends Bt {
  getValue(t) {
    return t.key;
  }
}, Jt = class extends Bt {
  getValue(t) {
    return [t.key, t.key];
  }
}, Ft = (t) => () => t, rt = (t) => {
  const e = t ? (r, n) => n.minus(r).abs().isLessThanOrEqualTo(t) : Ft(!1);
  return (r, n) => e(r, n) ? 0 : r.comparedTo(n);
};
function Wt(t) {
  const e = t ? (r, n, i, o, l) => r.exponentiatedBy(2).isLessThanOrEqualTo(
    o.minus(n).exponentiatedBy(2).plus(l.minus(i).exponentiatedBy(2)).times(t)
  ) : Ft(!1);
  return (r, n, i) => {
    const o = r.x, l = r.y, a = i.x, h = i.y, c = l.minus(h).times(n.x.minus(a)).minus(o.minus(a).times(n.y.minus(h)));
    return e(c, o, l, a, h) ? 0 : c.comparedTo(0);
  };
}
var Zt = (t) => t, Qt = (t) => {
  if (t) {
    const e = new qe(rt(t)), r = new qe(rt(t)), n = (o, l) => l.addAndReturn(o), i = (o) => ({
      x: n(o.x, e),
      y: n(o.y, r)
    });
    return i({ x: new fe(0), y: new fe(0) }), i;
  }
  return Zt;
}, nt = (t) => ({
  set: (e) => {
    pe = nt(e);
  },
  reset: () => nt(t),
  compare: rt(t),
  snap: Qt(t),
  orient: Wt(t)
}), pe = nt(), Se = (t, e) => t.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(t.ur.x) && t.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(t.ur.y), it = (t, e) => {
  if (e.ur.x.isLessThan(t.ll.x) || t.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(t.ll.y) || t.ur.y.isLessThan(e.ll.y))
    return null;
  const r = t.ll.x.isLessThan(e.ll.x) ? e.ll.x : t.ll.x, n = t.ur.x.isLessThan(e.ur.x) ? t.ur.x : e.ur.x, i = t.ll.y.isLessThan(e.ll.y) ? e.ll.y : t.ll.y, o = t.ur.y.isLessThan(e.ur.y) ? t.ur.y : e.ur.y;
  return { ll: { x: r, y: i }, ur: { x: n, y: o } };
}, Fe = (t, e) => t.x.times(e.y).minus(t.y.times(e.x)), It = (t, e) => t.x.times(e.x).plus(t.y.times(e.y)), De = (t) => It(t, t).sqrt(), jt = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return Fe(i, n).div(De(i)).div(De(n));
}, er = (t, e, r) => {
  const n = { x: e.x.minus(t.x), y: e.y.minus(t.y) }, i = { x: r.x.minus(t.x), y: r.y.minus(t.y) };
  return It(i, n).div(De(i)).div(De(n));
}, ht = (t, e, r) => e.y.isZero() ? null : { x: t.x.plus(e.x.div(e.y).times(r.minus(t.y))), y: r }, pt = (t, e, r) => e.x.isZero() ? null : { x: r, y: t.y.plus(e.y.div(e.x).times(r.minus(t.x))) }, tr = (t, e, r, n) => {
  if (e.x.isZero()) return pt(r, n, t.x);
  if (n.x.isZero()) return pt(t, e, r.x);
  if (e.y.isZero()) return ht(r, n, t.y);
  if (n.y.isZero()) return ht(t, e, r.y);
  const i = Fe(e, n);
  if (i.isZero()) return null;
  const o = { x: r.x.minus(t.x), y: r.y.minus(t.y) }, l = Fe(o, e).div(i), a = Fe(o, n).div(i), h = t.x.plus(a.times(e.x)), c = r.x.plus(l.times(n.x)), P = t.y.plus(a.times(e.y)), d = r.y.plus(l.times(n.y)), L = h.plus(c).div(2), A = P.plus(d).div(2);
  return { x: L, y: A };
}, ae = class Gt {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, r) {
    const n = Gt.comparePoints(e.point, r.point);
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
        sine: jt(this.point, e.point, o.point),
        cosine: er(this.point, e.point, o.point)
      });
    };
    return (i, o) => {
      r.has(i) || n(i), r.has(o) || n(o);
      const { sine: l, cosine: a } = r.get(i), { sine: h, cosine: c } = r.get(o);
      return l.isGreaterThanOrEqualTo(0) && h.isGreaterThanOrEqualTo(0) ? a.isLessThan(c) ? 1 : a.isGreaterThan(c) ? -1 : 0 : l.isLessThan(0) && h.isLessThan(0) ? a.isLessThan(c) ? -1 : a.isGreaterThan(c) ? 1 : 0 : h.isLessThan(l) ? -1 : h.isGreaterThan(l) ? 1 : 0;
    };
  }
}, rr = class st {
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
      const c = [a], P = a.point, d = [];
      for (; l = a, a = h, c.push(a), a.point !== P; )
        for (; ; ) {
          const L = a.getAvailableLinkedEvents();
          if (L.length === 0) {
            const b = c[0].point, T = c[c.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${b.x}, \${b.y}]. Last matching segment found ends at [\${T.x}, \${T.y}].\`
            );
          }
          if (L.length === 1) {
            h = L[0].otherSE;
            break;
          }
          let A = null;
          for (let b = 0, T = d.length; b < T; b++)
            if (d[b].point === a.point) {
              A = b;
              break;
            }
          if (A !== null) {
            const b = d.splice(A)[0], T = c.splice(b.index);
            T.unshift(T[0].otherSE), r.push(new st(T.reverse()));
            continue;
          }
          d.push({
            index: c.length,
            point: a.point
          });
          const M = a.getLeftmostComparator(l);
          h = L.sort(M)[0].otherSE;
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
    for (let c = 1, P = this.events.length - 1; c < P; c++) {
      const d = this.events[c].point, L = this.events[c + 1].point;
      pe.orient(d, e, L) !== 0 && (r.push(d), e = d);
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
}, gt = class {
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
}, nr = class {
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
        if (i.isExteriorRing()) e.push(new gt(i));
        else {
          const o = i.enclosingRing();
          o?.poly || e.push(new gt(o)), o?.poly?.addInterior(i);
        }
    }
    return e;
  }
}, ir = class {
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
          for (let c = 0, P = h.length; c < P; c++)
            r.push(h[c]);
        }
      }
      let l = null;
      if (i) {
        const a = i.getIntersection(e);
        if (a !== null && (e.isAnEndpoint(a) || (l = a), !i.isAnEndpoint(a))) {
          const h = this._splitSafely(i, a);
          for (let c = 0, P = h.length; c < P; c++)
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
        for (let c = 0, P = h.length; c < P; c++)
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
}, sr = class {
  type;
  numMultiPolys;
  run(t, e, r) {
    Le.type = t;
    const n = [new dt(e, !0)];
    for (let c = 0, P = r.length; c < P; c++)
      n.push(new dt(r[c], !1));
    if (Le.numMultiPolys = n.length, Le.type === "difference") {
      const c = n[0];
      let P = 1;
      for (; P < n.length; )
        it(n[P].bbox, c.bbox) !== null ? P++ : n.splice(P, 1);
    }
    if (Le.type === "intersection")
      for (let c = 0, P = n.length; c < P; c++) {
        const d = n[c];
        for (let L = c + 1, A = n.length; L < A; L++)
          if (it(d.bbox, n[L].bbox) === null) return [];
      }
    const i = new qe(ae.compare);
    for (let c = 0, P = n.length; c < P; c++) {
      const d = n[c].getSweepEvents();
      for (let L = 0, A = d.length; L < A; L++)
        i.add(d[L]);
    }
    const o = new ir(i);
    let l = null;
    for (i.size != 0 && (l = i.first(), i.delete(l)); l; ) {
      const c = o.process(l);
      for (let P = 0, d = c.length; P < d; P++) {
        const L = c[P];
        L.consumedBy === void 0 && i.add(L);
      }
      i.size != 0 ? (l = i.first(), i.delete(l)) : l = null;
    }
    pe.reset();
    const a = rr.factory(o.segments);
    return new nr(a).getGeom();
  }
}, Le = new sr(), ot = Le, or = 0, He = class Ie {
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
    const a = e.leftSE.point.y, h = r.leftSE.point.y, c = e.rightSE.point.y, P = r.rightSE.point.y;
    if (n.isLessThan(i)) {
      if (h.isLessThan(a) && h.isLessThan(c)) return 1;
      if (h.isGreaterThan(a) && h.isGreaterThan(c)) return -1;
      const d = e.comparePoint(r.leftSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
      const L = r.comparePoint(e.rightSE.point);
      return L !== 0 ? L : -1;
    }
    if (n.isGreaterThan(i)) {
      if (a.isLessThan(h) && a.isLessThan(P)) return -1;
      if (a.isGreaterThan(h) && a.isGreaterThan(P)) return 1;
      const d = r.comparePoint(e.leftSE.point);
      if (d !== 0) return d;
      const L = e.comparePoint(r.rightSE.point);
      return L < 0 ? 1 : L > 0 ? -1 : 1;
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
      const d = c.minus(a), L = o.minus(n), A = P.minus(h), M = l.minus(i);
      if (d.isGreaterThan(L) && A.isLessThan(M)) return 1;
      if (d.isLessThan(L) && A.isGreaterThan(M)) return -1;
    }
    return o.isGreaterThan(l) ? 1 : o.isLessThan(l) || c.isLessThan(P) ? -1 : c.isGreaterThan(P) ? 1 : e.id < r.id ? -1 : e.id > r.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, r, n, i) {
    this.id = ++or, this.leftSE = e, e.segment = this, e.otherSE = r, this.rightSE = r, r.segment = this, r.otherSE = e, this.rings = n, this.windings = i;
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
    const o = this.leftSE.point, l = this.rightSE.point, a = e.leftSE.point, h = e.rightSE.point, c = Se(r, a) && this.comparePoint(a) === 0, P = Se(n, o) && e.comparePoint(o) === 0, d = Se(r, h) && this.comparePoint(h) === 0, L = Se(n, l) && e.comparePoint(l) === 0;
    if (P && c)
      return L && !d ? l : !L && d ? h : null;
    if (P)
      return d && o.x.eq(h.x) && o.y.eq(h.y) ? null : o;
    if (c)
      return L && l.x.eq(a.x) && l.y.eq(a.y) ? null : a;
    if (L && d) return null;
    if (L) return l;
    if (d) return h;
    const A = tr(o, this.vector(), a, e.vector());
    return A === null || !Se(i, A) ? null : pe.snap(A);
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
      const c = this.rings[a], P = this.windings[a], d = r.indexOf(c);
      d === -1 ? (r.push(c), n.push(P)) : n[d] += P;
    }
    const o = [], l = [];
    for (let a = 0, h = r.length; a < h; a++) {
      if (n[a] === 0) continue;
      const c = r[a], P = c.poly;
      if (l.indexOf(P) === -1)
        if (c.isExterior) o.push(P);
        else {
          l.indexOf(P) === -1 && l.push(P);
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
}, yt = class {
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
}, lr = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(t, e) {
    if (!Array.isArray(t))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new yt(t[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let r = 1, n = t.length; r < n; r++) {
      const i = new yt(t[r], this, !1);
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
}, dt = class {
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
      const i = new lr(t[r], this);
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
}, ur = (t, ...e) => ot.run("union", t, e);
pe.set;
var j = 63710088e-1, ar = {
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
  if (!wt(t[0]) || !wt(t[1]))
    throw new Error("coordinates must contain numbers");
  return ge({
    type: "Point",
    coordinates: t
  }, e, r);
}
function fr(t, e, r = {}) {
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
function mt(t, e, r = {}) {
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
function cr(t, e, r = {}) {
  return ge({
    type: "MultiPolygon",
    coordinates: t
  }, e, r);
}
function hr(t, e = "kilometers") {
  const r = ar[e];
  if (!r)
    throw new Error(e + " units is invalid");
  return t * r;
}
function ke(t) {
  return t % 360 * Math.PI / 180;
}
function wt(t) {
  return !isNaN(t) && t !== null && !Array.isArray(t);
}
function pr(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function Oe(t, e, r) {
  if (t !== null)
    for (var n, i, o, l, a, h, c, P = 0, d = 0, L, A = t.type, M = A === "FeatureCollection", b = A === "Feature", T = M ? t.features.length : 1, O = 0; O < T; O++) {
      c = M ? (
        // @ts-expect-error: Known type conflict
        t.features[O].geometry
      ) : b ? (
        // @ts-expect-error: Known type conflict
        t.geometry
      ) : t, L = c ? c.type === "GeometryCollection" : !1, a = L ? c.geometries.length : 1;
      for (var m = 0; m < a; m++) {
        var R = 0, B = 0;
        if (l = L ? c.geometries[m] : c, l !== null) {
          h = l.coordinates;
          var C = l.type;
          switch (P = 0, C) {
            case null:
              break;
            case "Point":
              if (
                // @ts-expect-error: Known type conflict
                e(
                  h,
                  d,
                  O,
                  R,
                  B
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
                    O,
                    R,
                    B
                  ) === !1
                )
                  return !1;
                d++, C === "MultiPoint" && R++;
              }
              C === "LineString" && R++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (n = 0; n < h.length; n++) {
                for (i = 0; i < h[n].length - P; i++) {
                  if (
                    // @ts-expect-error: Known type conflict
                    e(
                      h[n][i],
                      d,
                      O,
                      R,
                      B
                    ) === !1
                  )
                    return !1;
                  d++;
                }
                C === "MultiLineString" && R++, C === "Polygon" && B++;
              }
              C === "Polygon" && R++;
              break;
            case "MultiPolygon":
              for (n = 0; n < h.length; n++) {
                for (B = 0, i = 0; i < h[n].length; i++) {
                  for (o = 0; o < h[n][i].length - P; o++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      e(
                        h[n][i][o],
                        d,
                        O,
                        R,
                        B
                      ) === !1
                    )
                      return !1;
                    d++;
                  }
                  B++;
                }
                R++;
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
function ut(t, e) {
  if (t.type === "Feature")
    e(t, 0);
  else if (t.type === "FeatureCollection")
    for (var r = 0; r < t.features.length && e(t.features[r], r) !== !1; r++)
      ;
}
function at(t, e) {
  var r, n, i, o, l, a, h, c, P, d, L = 0, A = t.type === "FeatureCollection", M = t.type === "Feature", b = A ? t.features.length : 1;
  for (r = 0; r < b; r++) {
    for (a = A ? (
      // @ts-expect-error: Known type conflict
      t.features[r].geometry
    ) : M ? (
      // @ts-expect-error: Known type conflict
      t.geometry
    ) : t, c = A ? (
      // @ts-expect-error: Known type conflict
      t.features[r].properties
    ) : M ? (
      // @ts-expect-error: Known type conflict
      t.properties
    ) : {}, P = A ? (
      // @ts-expect-error: Known type conflict
      t.features[r].bbox
    ) : M ? (
      // @ts-expect-error: Known type conflict
      t.bbox
    ) : void 0, d = A ? (
      // @ts-expect-error: Known type conflict
      t.features[r].id
    ) : M ? (
      // @ts-expect-error: Known type conflict
      t.id
    ) : void 0, h = a ? a.type === "GeometryCollection" : !1, l = h ? a.geometries.length : 1, i = 0; i < l; i++) {
      if (o = h ? a.geometries[i] : a, o === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            L,
            c,
            P,
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
              L,
              c,
              P,
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
                L,
                c,
                P,
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
    L++;
  }
}
function gr(t, e) {
  at(t, function(r, n, i, o, l) {
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
      var P = r.coordinates[c], d = {
        type: h,
        coordinates: P
      };
      if (
        // @ts-expect-error: Known type conflict
        e(ge(d, i), n, c) === !1
      )
        return !1;
    }
  });
}
function yr(t, e = {}) {
  const r = [];
  if (at(t, (i) => {
    r.push(i.coordinates);
  }), r.length < 2)
    throw new Error("Must have at least 2 geometries");
  const n = ur(r[0], ...r.slice(1));
  return n.length === 0 ? null : n.length === 1 ? fr(n[0], e.properties) : cr(n, e.properties);
}
function dr(t) {
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
  return ut(t, (r) => {
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
  return gr(t, function(r) {
    e.push(r);
  }), ve(e);
}
class mr {
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
function wr(t, e = 1, r = !1) {
  let n = 1 / 0, i = 1 / 0, o = -1 / 0, l = -1 / 0;
  for (const [O, m] of t[0])
    O < n && (n = O), m < i && (i = m), O > o && (o = O), m > l && (l = m);
  const a = o - n, h = l - i, c = Math.max(e, Math.min(a, h));
  if (c === e) {
    const O = [n, i];
    return O.distance = 0, O;
  }
  const P = new mr([], (O, m) => m.max - O.max);
  let d = vr(t);
  const L = new Ue(n + a / 2, i + h / 2, 0, t);
  L.d > d.d && (d = L);
  let A = 2;
  function M(O, m, R) {
    const B = new Ue(O, m, R, t);
    A++, B.max > d.d + e && P.push(B), B.d > d.d && (d = B, r && console.log(\`found best \${Math.round(1e4 * B.d) / 1e4} after \${A} probes\`));
  }
  let b = c / 2;
  for (let O = n; O < o; O += c)
    for (let m = i; m < l; m += c)
      M(O + b, m + b, b);
  for (; P.length; ) {
    const { max: O, x: m, y: R, h: B } = P.pop();
    if (O - d.d <= e) break;
    b = B / 2, M(m - b, R - b, b), M(m + b, R - b, b), M(m - b, R + b, b), M(m + b, R + b, b);
  }
  r && console.log(\`num probes: \${A}
best distance: \${d.d}\`);
  const T = [d.x, d.y];
  return T.distance = d.d, T;
}
function Ue(t, e, r, n) {
  this.x = t, this.y = e, this.h = r, this.d = xr(t, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function xr(t, e, r) {
  let n = !1, i = 1 / 0;
  for (const o of r)
    for (let l = 0, a = o.length, h = a - 1; l < a; h = l++) {
      const c = o[l], P = o[h];
      c[1] > e != P[1] > e && t < (P[0] - c[0]) * (e - c[1]) / (P[1] - c[1]) + c[0] && (n = !n), i = Math.min(i, br(t, e, c, P));
    }
  return i === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(i);
}
function vr(t) {
  let e = 0, r = 0, n = 0;
  const i = t[0];
  for (let l = 0, a = i.length, h = a - 1; l < a; h = l++) {
    const c = i[l], P = i[h], d = c[0] * P[1] - P[0] * c[1];
    r += (c[0] + P[0]) * d, n += (c[1] + P[1]) * d, e += d * 3;
  }
  const o = new Ue(r / e, n / e, 0, t);
  return e === 0 || o.d < 0 ? new Ue(i[0][0], i[0][1], 0, t) : o;
}
function br(t, e, r, n) {
  let i = r[0], o = r[1], l = n[0] - i, a = n[1] - o;
  if (l !== 0 || a !== 0) {
    const h = ((t - i) * l + (e - o) * a) / (l * l + a * a);
    h > 1 ? (i = n[0], o = n[1]) : h > 0 && (i += l * h, o += a * h);
  }
  return l = t - i, a = e - o, l * l + a * a;
}
function Er(t) {
  const e = [];
  return t.type === "FeatureCollection" ? ut(t, function(r) {
    Oe(r, function(n) {
      e.push(Ae(n, r.properties));
    });
  }) : t.type === "Feature" ? Oe(t, function(r) {
    e.push(Ae(r, t.properties));
  }) : Oe(t, function(r) {
    e.push(Ae(r));
  }), ve(e);
}
function Sr(t, e = {}) {
  if (t.bbox != null && e.recompute !== !0)
    return t.bbox;
  const r = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return Oe(t, (n) => {
    r[0] > n[0] && (r[0] = n[0]), r[1] > n[1] && (r[1] = n[1]), r[2] < n[0] && (r[2] = n[0]), r[3] < n[1] && (r[3] = n[1]);
  }), r;
}
function Pr(t, e = {}) {
  const r = Sr(t), n = (r[0] + r[2]) / 2, i = (r[1] + r[3]) / 2;
  return Ae([n, i], e.properties, e);
}
function qt(t) {
  if (!t)
    throw new Error("geojson is required");
  switch (t.type) {
    case "Feature":
      return Dt(t);
    case "FeatureCollection":
      return Mr(t);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return ft(t);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function Dt(t) {
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
  }), e.properties = Ht(t.properties), t.geometry == null ? e.geometry = null : e.geometry = ft(t.geometry), e;
}
function Ht(t) {
  const e = {};
  return t && Object.keys(t).forEach((r) => {
    const n = t[r];
    typeof n == "object" ? n === null ? e[r] = null : Array.isArray(n) ? e[r] = n.map((i) => i) : e[r] = Ht(n) : e[r] = n;
  }), e;
}
function Mr(t) {
  const e = { type: "FeatureCollection" };
  return Object.keys(t).forEach((r) => {
    switch (r) {
      case "type":
      case "features":
        return;
      default:
        e[r] = t[r];
    }
  }), e.features = t.features.map((r) => Dt(r)), e;
}
function ft(t) {
  const e = { type: t.type };
  return t.bbox && (e.bbox = t.bbox), t.type === "GeometryCollection" ? (e.geometries = t.geometries.map((r) => ft(r)), e) : (e.coordinates = Ut(t.coordinates), e);
}
function Ut(t) {
  const e = t;
  return typeof e[0] != "object" ? e.slice() : e.map((r) => Ut(r));
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
function Lr(t) {
  return t.type === "Feature" ? t.geometry : t;
}
function Ar(t, e) {
  return t.type === "FeatureCollection" ? "FeatureCollection" : t.type === "GeometryCollection" ? "GeometryCollection" : t.type === "Feature" && t.geometry !== null ? t.geometry.type : t.type;
}
function Or(t, e, r = {}) {
  var n = ze(t), i = ze(e), o = ke(i[1] - n[1]), l = ke(i[0] - n[0]), a = ke(n[1]), h = ke(i[1]), c = Math.pow(Math.sin(o / 2), 2) + Math.pow(Math.sin(l / 2), 2) * Math.cos(a) * Math.cos(h);
  return hr(
    2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c)),
    r.units
  );
}
var _r = Object.defineProperty, Nr = Object.defineProperties, Tr = Object.getOwnPropertyDescriptors, xt = Object.getOwnPropertySymbols, Cr = Object.prototype.hasOwnProperty, Rr = Object.prototype.propertyIsEnumerable, vt = (t, e, r) => e in t ? _r(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, bt = (t, e) => {
  for (var r in e || (e = {}))
    Cr.call(e, r) && vt(t, r, e[r]);
  if (xt)
    for (var r of xt(e))
      Rr.call(e, r) && vt(t, r, e[r]);
  return t;
}, Et = (t, e) => Nr(t, Tr(e));
function kr(t, e, r = {}) {
  if (!t) throw new Error("targetPoint is required");
  if (!e) throw new Error("points is required");
  let n = 1 / 0, i = 0;
  ut(e, (l, a) => {
    const h = Or(t, l, r);
    h < n && (i = a, n = h);
  });
  const o = qt(e.features[i]);
  return Et(bt({}, o), {
    properties: Et(bt({}, o.properties), {
      featureIndex: i,
      distanceToPoint: n
    })
  });
}
const he = 11102230246251565e-32, J = 134217729, Br = (3 + 8 * he) * he;
function Qe(t, e, r, n, i) {
  let o, l, a, h, c = e[0], P = n[0], d = 0, L = 0;
  P > c == P > -c ? (o = c, c = e[++d]) : (o = P, P = n[++L]);
  let A = 0;
  if (d < t && L < r)
    for (P > c == P > -c ? (l = c + o, a = o - (l - c), c = e[++d]) : (l = P + o, a = o - (l - P), P = n[++L]), o = l, a !== 0 && (i[A++] = a); d < t && L < r; )
      P > c == P > -c ? (l = o + c, h = l - o, a = o - (l - h) + (c - h), c = e[++d]) : (l = o + P, h = l - o, a = o - (l - h) + (P - h), P = n[++L]), o = l, a !== 0 && (i[A++] = a);
  for (; d < t; )
    l = o + c, h = l - o, a = o - (l - h) + (c - h), c = e[++d], o = l, a !== 0 && (i[A++] = a);
  for (; L < r; )
    l = o + P, h = l - o, a = o - (l - h) + (P - h), P = n[++L], o = l, a !== 0 && (i[A++] = a);
  return (o !== 0 || A === 0) && (i[A++] = o), A;
}
function Fr(t, e) {
  let r = e[0];
  for (let n = 1; n < t; n++) r += e[n];
  return r;
}
function Ne(t) {
  return new Float64Array(t);
}
const Ir = (3 + 16 * he) * he, Gr = (2 + 12 * he) * he, qr = (9 + 64 * he) * he * he, me = Ne(4), St = Ne(8), Pt = Ne(12), Mt = Ne(16), Z = Ne(4);
function Dr(t, e, r, n, i, o, l) {
  let a, h, c, P, d, L, A, M, b, T, O, m, R, B, C, N, k, s;
  const u = t - i, f = r - i, x = e - o, p = n - o;
  B = u * p, L = J * u, A = L - (L - u), M = u - A, L = J * p, b = L - (L - p), T = p - b, C = M * T - (B - A * b - M * b - A * T), N = x * f, L = J * x, A = L - (L - x), M = x - A, L = J * f, b = L - (L - f), T = f - b, k = M * T - (N - A * b - M * b - A * T), O = C - k, d = C - O, me[0] = C - (O + d) + (d - k), m = B + O, d = m - B, R = B - (m - d) + (O - d), O = R - N, d = R - O, me[1] = R - (O + d) + (d - N), s = m + O, d = s - m, me[2] = m - (s - d) + (O - d), me[3] = s;
  let y = Fr(4, me), v = Gr * l;
  if (y >= v || -y >= v || (d = t - u, a = t - (u + d) + (d - i), d = r - f, c = r - (f + d) + (d - i), d = e - x, h = e - (x + d) + (d - o), d = n - p, P = n - (p + d) + (d - o), a === 0 && h === 0 && c === 0 && P === 0) || (v = qr * l + Br * Math.abs(y), y += u * P + p * a - (x * c + f * h), y >= v || -y >= v)) return y;
  B = a * p, L = J * a, A = L - (L - a), M = a - A, L = J * p, b = L - (L - p), T = p - b, C = M * T - (B - A * b - M * b - A * T), N = h * f, L = J * h, A = L - (L - h), M = h - A, L = J * f, b = L - (L - f), T = f - b, k = M * T - (N - A * b - M * b - A * T), O = C - k, d = C - O, Z[0] = C - (O + d) + (d - k), m = B + O, d = m - B, R = B - (m - d) + (O - d), O = R - N, d = R - O, Z[1] = R - (O + d) + (d - N), s = m + O, d = s - m, Z[2] = m - (s - d) + (O - d), Z[3] = s;
  const g = Qe(4, me, 4, Z, St);
  B = u * P, L = J * u, A = L - (L - u), M = u - A, L = J * P, b = L - (L - P), T = P - b, C = M * T - (B - A * b - M * b - A * T), N = x * c, L = J * x, A = L - (L - x), M = x - A, L = J * c, b = L - (L - c), T = c - b, k = M * T - (N - A * b - M * b - A * T), O = C - k, d = C - O, Z[0] = C - (O + d) + (d - k), m = B + O, d = m - B, R = B - (m - d) + (O - d), O = R - N, d = R - O, Z[1] = R - (O + d) + (d - N), s = m + O, d = s - m, Z[2] = m - (s - d) + (O - d), Z[3] = s;
  const w = Qe(g, St, 4, Z, Pt);
  B = a * P, L = J * a, A = L - (L - a), M = a - A, L = J * P, b = L - (L - P), T = P - b, C = M * T - (B - A * b - M * b - A * T), N = h * c, L = J * h, A = L - (L - h), M = h - A, L = J * c, b = L - (L - c), T = c - b, k = M * T - (N - A * b - M * b - A * T), O = C - k, d = C - O, Z[0] = C - (O + d) + (d - k), m = B + O, d = m - B, R = B - (m - d) + (O - d), O = R - N, d = R - O, Z[1] = R - (O + d) + (d - N), s = m + O, d = s - m, Z[2] = m - (s - d) + (O - d), Z[3] = s;
  const S = Qe(w, Pt, 4, Z, Mt);
  return Mt[S - 1];
}
function Hr(t, e, r, n, i, o) {
  const l = (e - o) * (r - i), a = (t - i) * (n - o), h = l - a, c = Math.abs(l + a);
  return Math.abs(h) >= Ir * c ? h : -Dr(t, e, r, n, i, o, c);
}
function Ur(t, e) {
  var r, n, i = 0, o, l, a, h, c, P, d, L = t[0], A = t[1], M = e.length;
  for (r = 0; r < M; r++) {
    n = 0;
    var b = e[r], T = b.length - 1;
    if (P = b[0], P[0] !== b[T][0] && P[1] !== b[T][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (l = P[0] - L, a = P[1] - A, n; n < T; n++) {
      if (d = b[n + 1], h = d[0] - L, c = d[1] - A, a === 0 && c === 0) {
        if (h <= 0 && l >= 0 || l <= 0 && h >= 0)
          return 0;
      } else if (c >= 0 && a <= 0 || c <= 0 && a >= 0) {
        if (o = Hr(l, h, a, c, 0, 0), o === 0)
          return 0;
        (o > 0 && c > 0 && a <= 0 || o < 0 && c <= 0 && a > 0) && i++;
      }
      P = d, a = c, l = h;
    }
  }
  return i % 2 !== 0;
}
function zr(t, e, r = {}) {
  if (!t)
    throw new Error("point is required");
  if (!e)
    throw new Error("polygon is required");
  const n = ze(t), i = Lr(e), o = i.type, l = e.bbox;
  let a = i.coordinates;
  if (l && Vr(n, l) === !1)
    return !1;
  o === "Polygon" && (a = [a]);
  let h = !1;
  for (var c = 0; c < a.length; ++c) {
    const P = Ur(n, a[c]);
    if (P === 0) return !r.ignoreBoundary;
    P && (h = !0);
  }
  return h;
}
function Vr(t, e) {
  return e[0] <= t[0] && e[1] <= t[1] && e[2] >= t[0] && e[3] >= t[1];
}
function Lt(t) {
  const e = $r(t), r = Pr(e);
  let n = !1, i = 0;
  for (; !n && i < e.features.length; ) {
    const o = e.features[i].geometry;
    let l, a, h, c, P, d, L = !1;
    if (o.type === "Point")
      r.geometry.coordinates[0] === o.coordinates[0] && r.geometry.coordinates[1] === o.coordinates[1] && (n = !0);
    else if (o.type === "MultiPoint") {
      let A = !1, M = 0;
      for (; !A && M < o.coordinates.length; )
        r.geometry.coordinates[0] === o.coordinates[M][0] && r.geometry.coordinates[1] === o.coordinates[M][1] && (n = !0, A = !0), M++;
    } else if (o.type === "LineString") {
      let A = 0;
      for (; !L && A < o.coordinates.length - 1; )
        l = r.geometry.coordinates[0], a = r.geometry.coordinates[1], h = o.coordinates[A][0], c = o.coordinates[A][1], P = o.coordinates[A + 1][0], d = o.coordinates[A + 1][1], At(l, a, h, c, P, d) && (L = !0, n = !0), A++;
    } else if (o.type === "MultiLineString") {
      let A = 0;
      for (; A < o.coordinates.length; ) {
        L = !1;
        let M = 0;
        const b = o.coordinates[A];
        for (; !L && M < b.length - 1; )
          l = r.geometry.coordinates[0], a = r.geometry.coordinates[1], h = b[M][0], c = b[M][1], P = b[M + 1][0], d = b[M + 1][1], At(l, a, h, c, P, d) && (L = !0, n = !0), M++;
        A++;
      }
    } else (o.type === "Polygon" || o.type === "MultiPolygon") && zr(r, o) && (n = !0);
    i++;
  }
  if (n)
    return r;
  {
    const o = ve([]);
    for (let l = 0; l < e.features.length; l++)
      o.features = o.features.concat(
        Er(e.features[l]).features
      );
    return Ae(kr(r, o).geometry.coordinates);
  }
}
function $r(t) {
  return t.type !== "FeatureCollection" ? t.type !== "Feature" ? ve([ge(t)]) : ve([t]) : t;
}
function At(t, e, r, n, i, o) {
  const l = Math.sqrt((i - r) * (i - r) + (o - n) * (o - n)), a = Math.sqrt((t - r) * (t - r) + (e - n) * (e - n)), h = Math.sqrt((i - t) * (i - t) + (o - e) * (o - e));
  return l === a + h;
}
function Ot(t, e, r = {}) {
  const n = ze(t), i = _e(e);
  for (let o = 0; o < i.length - 1; o++) {
    let l = !1;
    if (r.ignoreEndVertices && (o === 0 && (l = "start"), o === i.length - 2 && (l = "end"), o === 0 && o + 1 === i.length - 1 && (l = "both")), Kr(
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
function Kr(t, e, r, n, i) {
  const o = r[0], l = r[1], a = t[0], h = t[1], c = e[0], P = e[1], d = r[0] - a, L = r[1] - h, A = c - a, M = P - h, b = d * M - L * A;
  if (i !== null) {
    if (Math.abs(b) > i)
      return !1;
  } else if (b !== 0)
    return !1;
  if (Math.abs(A) === Math.abs(M) && Math.abs(A) === 0)
    return n ? !1 : r[0] === t[0] && r[1] === t[1];
  if (n) {
    if (n === "start")
      return Math.abs(A) >= Math.abs(M) ? A > 0 ? a < o && o <= c : c <= o && o < a : M > 0 ? h < l && l <= P : P <= l && l < h;
    if (n === "end")
      return Math.abs(A) >= Math.abs(M) ? A > 0 ? a <= o && o < c : c < o && o <= a : M > 0 ? h <= l && l < P : P < l && l <= h;
    if (n === "both")
      return Math.abs(A) >= Math.abs(M) ? A > 0 ? a < o && o < c : c < o && o < a : M > 0 ? h < l && l < P : P < l && l < h;
  } else return Math.abs(A) >= Math.abs(M) ? A > 0 ? a <= o && o <= c : c <= o && o <= a : M > 0 ? h <= l && l <= P : P <= l && l <= h;
  return !1;
}
function Xr(t, e = {}) {
  var r = typeof e == "object" ? e.mutate : e;
  if (!t) throw new Error("geojson is required");
  var n = Ar(t), i = [];
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
  if (r.length === 2 && !_t(r[0], r[1])) return r;
  const n = [];
  let i = 0, o = 1, l = 2;
  for (n.push(r[i]); l < r.length; )
    Ot(r[o], mt([r[i], r[l]])) ? o = l : (n.push(r[o]), i = o, o++, l = o), l++;
  if (n.push(r[o]), e === "Polygon" || e === "MultiPolygon") {
    if (Ot(
      n[0],
      mt([n[1], n[n.length - 2]])
    ) && (n.shift(), n.pop(), n.push(n[0])), n.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!_t(n[0], n[n.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return n;
}
function _t(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}
function Yr(t, e) {
  var r = t[0] - e[0], n = t[1] - e[1];
  return r * r + n * n;
}
function Jr(t, e, r) {
  var n = e[0], i = e[1], o = r[0] - n, l = r[1] - i;
  if (o !== 0 || l !== 0) {
    var a = ((t[0] - n) * o + (t[1] - i) * l) / (o * o + l * l);
    a > 1 ? (n = r[0], i = r[1]) : a > 0 && (n += o * a, i += l * a);
  }
  return o = t[0] - n, l = t[1] - i, o * o + l * l;
}
function Wr(t, e) {
  for (var r = t[0], n = [r], i, o = 1, l = t.length; o < l; o++)
    i = t[o], Yr(i, r) > e && (n.push(i), r = i);
  return r !== i && n.push(i), n;
}
function lt(t, e, r, n, i) {
  for (var o = n, l, a = e + 1; a < r; a++) {
    var h = Jr(t[a], t[e], t[r]);
    h > o && (l = a, o = h);
  }
  o > n && (l - e > 1 && lt(t, e, l, n, i), i.push(t[l]), r - l > 1 && lt(t, l, r, n, i));
}
function Zr(t, e) {
  var r = t.length - 1, n = [t[0]];
  return lt(t, 0, r, e, n), n.push(t[r]), n;
}
function Ve(t, e, r) {
  if (t.length <= 2) return t;
  var n = e !== void 0 ? e * e : 1;
  return t = r ? t : Wr(t, n), t = Zr(t, n), t;
}
function Nt(t, e = {}) {
  var r, n, i;
  if (e = e ?? {}, !pr(e)) throw new Error("options is invalid");
  const o = (r = e.tolerance) != null ? r : 1, l = (n = e.highQuality) != null ? n : !1, a = (i = e.mutate) != null ? i : !1;
  if (!t) throw new Error("geojson is required");
  if (o && o < 0) throw new Error("invalid tolerance");
  return a !== !0 && (t = qt(t)), at(t, function(h) {
    Qr(h, o, l);
  }), t;
}
function Qr(t, e, r) {
  const n = t.type;
  if (n === "Point" || n === "MultiPoint") return t;
  if (Xr(t, { mutate: !0 }), n !== "GeometryCollection")
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
        t.coordinates = Tt(
          t.coordinates,
          e,
          r
        );
        break;
      case "MultiPolygon":
        t.coordinates = t.coordinates.map(
          (i) => Tt(i, e, r)
        );
    }
  return t;
}
function Tt(t, e, r) {
  return t.map(function(n) {
    if (n.length < 4)
      throw new Error("invalid polygon");
    let i = e, o = Ve(n, i, r);
    for (; !Ct(o) && i >= Number.EPSILON; )
      i -= i * 0.01, o = Ve(n, i, r);
    return Ct(o) ? ((o[o.length - 1][0] !== o[0][0] || o[o.length - 1][1] !== o[0][1]) && o.push(o[0]), o) : n;
  });
}
function Ct(t) {
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
let ue = !1;
function Be(t, e = {}) {
  const r = [], n = [], i = [], o = new TextEncoder(), l = [], a = /* @__PURE__ */ new Map();
  let h = 0, c = 0;
  const P = (b) => {
    if (Array.isArray(b)) {
      const T = Number(b[0]), O = Number(b[1]);
      n.push(Number.isFinite(T) ? T : 0, Number.isFinite(O) ? O : 0);
    } else if (b && (typeof b.x == "number" || typeof b.y == "number")) {
      const T = Number(b.x), O = Number(b.y);
      n.push(Number.isFinite(T) ? T : 0, Number.isFinite(O) ? O : 0);
    } else
      n.push(0, 0);
  };
  for (const b of t) {
    const T = b.id == null ? "" : String(b.id), O = b.geometry || {}, m = O.type || "Unknown", R = { id: T, type: m, coordsOffset: h, coordsLength: 0 };
    if (m === "Point") {
      const N = O.coordinates || [];
      P(N), R.coordsLength = 2;
    } else if (m === "LineString" || m === "MultiPoint") {
      const N = O.coordinates || [];
      for (const k of N) P(k);
      R.coordsLength = (N.length || 0) * 2;
    } else if (m === "Polygon") {
      const N = O.coordinates || [];
      R.ringLengths = [];
      for (const k of N) {
        R.ringLengths.push(k.length || 0);
        for (const s of k) P(s);
      }
      R.coordsLength = R.ringLengths.reduce((k, s) => k + s, 0) * 2;
    } else if (m === "MultiPolygon") {
      const N = O.coordinates || [];
      R.polygonRingCounts = [], R.ringLengths = [];
      for (const k of N) {
        R.polygonRingCounts.push(k.length || 0);
        for (const s of k) {
          R.ringLengths.push(s.length || 0);
          for (const u of s) P(u);
        }
      }
      R.coordsLength = R.ringLengths.reduce((k, s) => k + s, 0) * 2;
    } else
      R.coordsLength = 0;
    const B = b.properties || {}, C = [];
    for (const N of Object.keys(B)) {
      let k = a.get(N);
      k === void 0 && (k = l.length, l.push(N), a.set(N, k));
      const s = JSON.stringify(B[N]), u = o.encode(s);
      i.push(u), C.push([k, c, u.length]), c += u.length;
    }
    R.props = C, h += R.coordsLength, r.push(R);
  }
  let d;
  if (e.propsBuffer)
    e.propsBuffer instanceof Uint8Array ? d = e.propsBuffer.subarray(0, c) : d = new Uint8Array(e.propsBuffer, 0, c), d.byteLength < c && (d = new Uint8Array(c));
  else if (e.pool) {
    const b = e.pool.rent(c || 1);
    d = new Uint8Array(b, 0, c);
  } else
    d = new Uint8Array(c);
  let L = 0;
  for (const b of i)
    d.set(b, L), L += b.length;
  const A = n.length;
  let M;
  if (e.coordsBuffer)
    e.coordsBuffer instanceof ArrayBuffer ? M = new Float32Array(e.coordsBuffer, 0, A) : e.coordsBuffer instanceof Float32Array ? M = e.coordsBuffer.subarray(0, A) : M = new Float32Array(A), M.length < A && (M = new Float32Array(A));
  else if (e.pool) {
    const b = e.pool.rent(A * 4 || 4);
    M = new Float32Array(b, 0, A);
  } else
    M = new Float32Array(A);
  return M.length > 0 && M.set(n), { meta: r, keys: l, propsBuffer: d, coordsArray: M };
}
function jr(t, e, r, n) {
  const i = r instanceof Float32Array ? r : new Float32Array(r), o = e instanceof Uint8Array ? e : e ? new Uint8Array(e) : new Uint8Array(0), l = new TextDecoder(), a = [];
  for (let h = 0; h < (t.length || 0); h++) {
    const c = t[h] || {}, P = c.id, d = {};
    if (Array.isArray(c.props) && c.props.length && n && n.length)
      for (const O of c.props) {
        const [m, R, B] = O;
        try {
          const C = o.subarray(R, R + B);
          d[n[m]] = JSON.parse(l.decode(C));
        } catch {
        }
      }
    const L = c.type || "Unknown";
    let A = c.coordsOffset || 0;
    const M = A + (c.coordsLength || 0);
    let b = null;
    if (L === "Point") {
      const O = i[A], m = i[A + 1], R = Number.isFinite(O) ? Math.max(-180, Math.min(180, O)) : 0, B = Number.isFinite(m) ? Math.max(-90, Math.min(90, m)) : 0;
      if ((!Number.isFinite(O) || !Number.isFinite(m)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value", { index: h, id: P, rawX: O, rawY: m });
        } catch {
        }
      }
      b = { type: "Point", coordinates: [R, B] };
    } else if (L === "LineString" || L === "MultiPoint") {
      const O = [];
      for (; A < M; A += 2) {
        const m = i[A], R = i[A + 1], B = Number.isFinite(m) ? Math.max(-180, Math.min(180, m)) : 0, C = Number.isFinite(R) ? Math.max(-90, Math.min(90, R)) : 0;
        if ((!Number.isFinite(m) || !Number.isFinite(R)) && !ue) {
          ue = !0;
          try {
            console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value", { index: h, id: P, rawX: m, rawY: R });
          } catch {
          }
        }
        O.push([B, C]);
      }
      b = { type: L, coordinates: O };
    } else if (L === "Polygon") {
      const O = [], m = c.ringLengths || [];
      for (const R of m) {
        const B = [];
        for (let C = 0; C < R; C++) {
          const N = i[A], k = i[A + 1], s = Number.isFinite(N) ? Math.max(-180, Math.min(180, N)) : 0, u = Number.isFinite(k) ? Math.max(-90, Math.min(90, k)) : 0;
          if ((!Number.isFinite(N) || !Number.isFinite(k)) && !ue) {
            ue = !0;
            try {
              console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value", { index: h, id: P, rawX: N, rawY: k });
            } catch {
            }
          }
          B.push([s, u]), A += 2;
        }
        O.push(B);
      }
      b = { type: "Polygon", coordinates: O };
    } else if (L === "MultiPolygon") {
      const O = [], m = c.polygonRingCounts || [], R = c.ringLengths || [];
      let B = 0;
      for (const C of m) {
        const N = [];
        for (let k = 0; k < C; k++) {
          const s = R[B++] || 0, u = [];
          for (let f = 0; f < s; f++) {
            const x = i[A], p = i[A + 1], y = Number.isFinite(x) ? Math.max(-180, Math.min(180, x)) : 0, v = Number.isFinite(p) ? Math.max(-90, Math.min(90, p)) : 0;
            if ((!Number.isFinite(x) || !Number.isFinite(p)) && !ue) {
              ue = !0;
              try {
                console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value", { index: h, id: P, rawX: x, rawY: p });
              } catch {
              }
            }
            u.push([y, v]), A += 2;
          }
          N.push(u);
        }
        O.push(N);
      }
      b = { type: "MultiPolygon", coordinates: O };
    } else if (A < M) {
      const O = i[A], m = i[A + 1], R = Number.isFinite(O) ? Math.max(-180, Math.min(180, O)) : 0, B = Number.isFinite(m) ? Math.max(-90, Math.min(90, m)) : 0;
      if ((!Number.isFinite(O) || !Number.isFinite(m)) && !ue) {
        ue = !0;
        try {
          console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value", { index: h, id: P, rawX: O, rawY: m });
        } catch {
        }
      }
      b = { type: "Point", coordinates: [R, B] };
    }
    b == null && (b = { type: "Point", coordinates: [0, 0] });
    const T = d && typeof d == "object" ? d : {};
    a.push({ type: "Feature", id: P, geometry: b, properties: T });
  }
  return a;
}
const Pe = new $e(), z = /* @__PURE__ */ new Map();
let et = 1e4, we = null;
const en = (t, e) => {
  try {
    const r = t && t.geometry && t.geometry.coordinates;
    let n = wr(r, e);
    return (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1])) && (n = Lt(t).geometry.coordinates), {
      type: "Point",
      coordinates: [n[0], n[1]]
    };
  } catch {
    return console.log("Invalid feature geometry", t && t.id), Lt(t).geometry;
  }
}, tn = new ArrayBuffer(8), tt = new DataView(tn), rn = new ArrayBuffer(4), Rt = new DataView(rn);
function zt() {
  return 2166136261;
}
function ie(t, e) {
  return t ^= e >>> 0, t = Math.imul(t, 16777619) >>> 0, t;
}
function nn(t, e) {
  const r = Number(e) || 0;
  return tt.setFloat64(0, r, !0), t = ie(t, tt.getUint32(0, !0)), t = ie(t, tt.getUint32(4, !0)), t;
}
function oe(t, e) {
  const r = Number(e) || 0;
  return Rt.setFloat32(0, r, !0), t = ie(t, Rt.getUint32(0, !0)), t;
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
  let e = zt();
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
function Vt(t, e, r = 1e-6) {
  if (typeof t == "number" && typeof e == "number") return Math.abs(t - e) <= r;
  if (Array.isArray(t) && Array.isArray(e)) {
    if (t.length !== e.length) return !1;
    for (let n = 0; n < t.length; n++)
      if (!Vt(t[n], e[n], r)) return !1;
    return !0;
  }
  return !1;
}
function sn(t, e) {
  return !t && !e ? !0 : !t || !e || t.type !== e.type ? !1 : Vt(t.coordinates, e.coordinates);
}
function on(t) {
  let e = zt();
  e = ie(e, t.length || 0);
  for (const r of t)
    if (e = Ge(e, r && r.id != null ? String(r.id) : ""), r && r.geometry && (e = ie(e, xe(r.geometry))), r && r.properties) {
      const n = Object.keys(r.properties).sort();
      for (const i of n) {
        e = Ge(e, i);
        const o = r.properties[i];
        o == null ? e = ie(e, 0) : typeof o == "number" ? e = nn(e, o) : e = Ge(e, String(o));
      }
    }
  return e;
}
onmessage = (t) => {
  let e = t && t.data;
  if (e && e.type === "diff_ack") {
    try {
      if (we) {
        for (const M of we.addList || []) {
          const b = M && (M.feature || M);
          if (b && b.id != null)
            try {
              const T = M && M.geomHash !== void 0 ? M.geomHash : xe(b.geometry), O = M && M.rawHash !== void 0 ? M.rawHash : T;
              z.set(String(b.id), { feature: b, geomHash: T, rawHash: O, ts: Date.now() });
            } catch {
              z.set(String(b.id), { feature: b, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const M of we.updateList || []) {
          const b = M && (M.feature || M);
          if (b && b.id != null)
            try {
              const T = M && M.geomHash !== void 0 ? M.geomHash : xe(b.geometry), O = M && M.rawHash !== void 0 ? M.rawHash : T;
              z.set(String(b.id), { feature: b, geomHash: T, rawHash: O, ts: Date.now() });
            } catch {
              z.set(String(b.id), { feature: b, geomHash: 0, rawHash: 0, ts: Date.now() });
            }
        }
        for (const M of we.removeList || [])
          try {
            z.delete(String(M));
          } catch {
          }
        for (; z.size > et; ) {
          const M = z.keys().next();
          if (M.done) break;
          z.delete(M.value);
        }
        we = null;
      }
    } catch {
    }
    return;
  }
  if (e && e.type === "request_full") {
    try {
      const M = Array.from(z.values()).map((R) => R.feature), { meta: b, keys: T, propsBuffer: O, coordsArray: m } = Be(M || [], { pool: Pe });
      postMessage({ type: "geojson_bin", meta: b, keys: T, propsBuf: O.buffer, coords: m.buffer }, [O.buffer, m.buffer]);
    } catch {
    }
    return;
  }
  if (e && e.type === "features" && e.payload)
    try {
      const M = e.payload instanceof Uint8Array ? e.payload.buffer : e.payload, b = new TextDecoder().decode(M);
      e = JSON.parse(b);
    } catch {
      e = {};
    }
  if (e && e.type === "features_bin" && e.coords)
    try {
      const M = e.meta || [], b = e.propsBuf !== void 0 ? e.propsBuf : null, T = e.coords, O = e.keys || [];
      e = { features: jr(M, b, T, O), tolerance: t.data && t.data.tolerance, promoteId: t.data && t.data.promoteId, _receivedPropsBuf: b, _receivedCoordsBuf: T, _receivedKeys: O, cacheSize: t.data && t.data.cacheSize };
    } catch {
      e = e || {};
    }
  const r = e || {}, n = r.features || [], i = r.tolerance || 1e-5, o = !0, l = /* @__PURE__ */ new Map();
  for (const M of n) {
    const b = M.id, T = l.get(b) || [];
    T.push(M), l.set(b, T);
  }
  const a = { type: "FeatureCollection", features: [] }, h = [], c = [], P = /* @__PURE__ */ new Set(), d = [], L = /* @__PURE__ */ new Map();
  for (const [M, b] of l.entries()) {
    const T = String(M), O = on(b), m = z.get(T);
    if (m && m.rawHash === O) {
      d.push(m.feature);
      continue;
    }
    const { clipped: R, ...B } = b[0] && b[0].properties || {};
    let C;
    if (b.length === 1) {
      const s = b[0].geometry;
      C = Nt(Ze({ type: "Feature", id: M, geometry: s, properties: B }), { tolerance: i, mutate: o });
    } else
      C = Nt(Ze({ type: "FeatureCollection", features: b.map((s) => ({ type: "Feature", id: M, geometry: s.geometry, properties: B })) }), { tolerance: i, mutate: o }), b.some((s) => s.properties && s.properties.clipped) && (C = Ze(yr(C)));
    C.features.forEach((s) => (s.id = M, s.geometry.type === "Polygon" ? s.geometry = en(s, i) : console.log("Unexpected geometry type after union/simplify/flatten for id:" + M + " - type:" + s.geometry.type), s)), C = dr(C);
    const N = { type: "Feature", id: M, geometry: C.features[0].geometry, properties: B }, k = xe(N.geometry);
    if (!m)
      h.push(N);
    else if (k !== (m.geomHash || 0))
      try {
        sn(N.geometry, m.feature.geometry) || (c.push(N), P.add(T));
      } catch {
        c.push(N), P.add(T);
      }
    L.set(T, { feature: N, rawHash: O, geomHash: k }), d.push(N);
  }
  const A = r.promoteId;
  if (A)
    for (const M of d)
      M.properties || (M.properties = {}), M.id != null && (M.properties[A] === void 0 || M.properties[A] === null) && (M.properties[A] = M.id);
  try {
    e && typeof e.cacheSize == "number" && e.cacheSize > 0 && (et = e.cacheSize);
    const M = d && d.length ? d : a.features || [];
    if (z.size === 0) {
      for (const [u, f] of L.entries())
        try {
          z.set(u, { feature: f.feature, geomHash: f.geomHash, rawHash: f.rawHash, ts: Date.now() });
        } catch {
          z.set(u, { feature: f.feature, geomHash: f.geomHash || 0, rawHash: f.rawHash || 0, ts: Date.now() });
        }
      const { meta: C, keys: N, propsBuffer: k, coordsArray: s } = Be(M || [], { pool: Pe });
      postMessage({ type: "geojson_bin", meta: C, keys: N, propsBuf: k.buffer, coords: s.buffer }, [k.buffer, s.buffer]);
      return;
    }
    const b = h.length;
    let T = Math.max(0, z.size + b - et);
    const O = [];
    if (T > 0) {
      for (const C of z.keys()) {
        if (O.length >= T) break;
        if (P.has(C)) continue;
        const N = z.get(C);
        O.push(N && N.feature && N.feature.id != null ? N.feature.id : C);
      }
      if (O.length < T)
        for (const C of z.keys()) {
          if (O.length >= T) break;
          if (O.includes(C)) continue;
          const N = z.get(C);
          O.push(N && N.feature && N.feature.id != null ? N.feature.id : C);
        }
    }
    if (h.length === 0 && c.length === 0 && O.length === 0)
      return;
    const m = c.map((C) => {
      const N = { id: C.id };
      C.geometry && (N.newGeometry = C.geometry);
      const k = z.get(String(C.id)), s = k && k.feature && k.feature.properties ? k.feature.properties : {}, u = C.properties || {}, f = Object.keys(s), x = Object.keys(u);
      if (x.length === 0 && f.length > 0)
        N.removeAllProperties = !0;
      else {
        const y = f.filter((v) => !(v in u));
        y.length && (N.removeProperties = y);
      }
      const p = x.filter((y) => u[y] !== s[y]).map((y) => ({ key: y, value: u[y] }));
      return p.length && (N.addOrUpdateProperties = p), N;
    }), R = h.map((C) => {
      const N = L.get(String(C.id));
      if (N) return { feature: N.feature, rawHash: N.rawHash, geomHash: N.geomHash };
      try {
        const k = xe(C.geometry);
        return { feature: C, rawHash: k, geomHash: k };
      } catch {
        return { feature: C, rawHash: 0, geomHash: 0 };
      }
    }), B = c.map((C) => {
      const N = L.get(String(C.id));
      if (N) return { feature: N.feature, rawHash: N.rawHash, geomHash: N.geomHash };
      try {
        const k = xe(C.geometry);
        return { feature: C, rawHash: k, geomHash: k };
      } catch {
        return { feature: C, rawHash: 0, geomHash: 0 };
      }
    });
    we = { addList: R, updateList: B, removeList: O };
    try {
      const C = { type: "geojson_diff_bin" };
      O.length && (z.size > 0 && O.length >= z.size ? C.removeAll = !0 : C.removeList = O);
      const N = [];
      if (h.length) {
        const { meta: k, keys: s, propsBuffer: u, coordsArray: f } = Be(h || [], { pool: Pe });
        C.add = { meta: k, keys: s, propsBuf: u.buffer, coords: f.buffer }, u && u.buffer && N.push(u.buffer), f && f.buffer && N.push(f.buffer);
      }
      if (c.length) {
        const { meta: k, keys: s, propsBuffer: u, coordsArray: f } = Be(c || [], { pool: Pe });
        C.update = { meta: k, keys: s, propsBuf: u.buffer, coords: f.buffer }, u && u.buffer && N.push(u.buffer), f && f.buffer && N.push(f.buffer);
      }
      if (m.length) {
        const k = [], s = /* @__PURE__ */ new Map(), u = [];
        let f = 0;
        const x = m.map((y) => {
          const v = { id: y.id };
          return y.removeAllProperties && (v.removeAllProperties = !0), Array.isArray(y.removeProperties) && y.removeProperties.length && (v.removeProperties = y.removeProperties.map((g) => {
            let w = s.get(g);
            return w === void 0 && (w = k.length, k.push(g), s.set(g, w)), w;
          })), Array.isArray(y.addOrUpdateProperties) && y.addOrUpdateProperties.length && (v.addOrUpdate = y.addOrUpdateProperties.map((g) => {
            const w = g.key;
            let S = s.get(w);
            S === void 0 && (S = k.length, k.push(w), s.set(w, S));
            const E = JSON.stringify(g.value), _ = new TextEncoder().encode(E);
            u.push(_);
            const F = f, I = _.length;
            return f += I, [S, F, I];
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
        C.updateDiffsMeta = x, C.updateKeys = k, p && p.buffer && p.byteLength && (C.updatePropsBuf = p.buffer, N.push(p.buffer));
      }
      postMessage(C, N);
      return;
    } catch {
      try {
        const N = {};
        O.length && (z.size > 0 && O.length >= z.size ? N.removeAll = !0 : N.remove = O), h.length && (N.add = h), m.length && (N.update = m), postMessage({ type: "geojson_diff", diff: N });
        return;
      } catch {
      }
    }
    return;
  } catch {
    try {
      const b = new TextEncoder(), T = JSON.stringify(a), O = b.encode(T);
      postMessage({ type: "geojson", payload: O.buffer }, [O.buffer]);
    } catch {
      postMessage(a);
    }
  }
};
`,yn=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",vn],{type:"text/javascript;charset=utf-8"});function ie(r){let n;try{if(n=yn&&(self.URL||self.webkitURL).createObjectURL(yn),!n)throw"";const e=new Worker(n,{type:"module",name:r?.name});return e.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(n)}),e}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(vn),{type:"module",name:r?.name})}}class ${constructor(){this.map=new Map}static _nextPow2(n){return n<=0?0:(n=n-1>>>0,n|=n>>1,n|=n>>2,n|=n>>4,n|=n>>8,n|=n>>16,n+1>>>0)}rent(n){const e=$._nextPow2(n||1),s=this.map.get(e);return s&&s.length?s.pop():new ArrayBuffer(e)}release(n){if(!n||!n.byteLength)return;const e=$._nextPow2(n.byteLength);let s=this.map.get(e);s||(s=[],this.map.set(e,s)),s.push(n)}}let N=!1;function se(r,n={}){const e=[],s=[],i=[],l=new TextEncoder,a=[],p=new Map;let c=0,g=0;const y=w=>{if(Array.isArray(w)){const M=Number(w[0]),m=Number(w[1]);s.push(Number.isFinite(M)?M:0,Number.isFinite(m)?m:0)}else if(w&&(typeof w.x=="number"||typeof w.y=="number")){const M=Number(w.x),m=Number(w.y);s.push(Number.isFinite(M)?M:0,Number.isFinite(m)?m:0)}else s.push(0,0)};for(const w of r){const M=w.id==null?"":String(w.id),m=w.geometry||{},P=m.type||"Unknown",b={id:M,type:P,coordsOffset:c,coordsLength:0};if(P==="Point"){const F=m.coordinates||[];y(F),b.coordsLength=2}else if(P==="LineString"||P==="MultiPoint"){const F=m.coordinates||[];for(const E of F)y(E);b.coordsLength=(F.length||0)*2}else if(P==="Polygon"){const F=m.coordinates||[];b.ringLengths=[];for(const E of F){b.ringLengths.push(E.length||0);for(const k of E)y(k)}b.coordsLength=b.ringLengths.reduce((E,k)=>E+k,0)*2}else if(P==="MultiPolygon"){const F=m.coordinates||[];b.polygonRingCounts=[],b.ringLengths=[];for(const E of F){b.polygonRingCounts.push(E.length||0);for(const k of E){b.ringLengths.push(k.length||0);for(const O of k)y(O)}}b.coordsLength=b.ringLengths.reduce((E,k)=>E+k,0)*2}else b.coordsLength=0;const _=w.properties||{},L=[];for(const F of Object.keys(_)){let E=p.get(F);E===void 0&&(E=a.length,a.push(F),p.set(F,E));const k=JSON.stringify(_[F]),O=l.encode(k);i.push(O),L.push([E,g,O.length]),g+=O.length}b.props=L,c+=b.coordsLength,e.push(b)}let x;if(n.propsBuffer)n.propsBuffer instanceof Uint8Array?x=n.propsBuffer.subarray(0,g):x=new Uint8Array(n.propsBuffer,0,g),x.byteLength<g&&(x=new Uint8Array(g));else if(n.pool){const w=n.pool.rent(g||1);x=new Uint8Array(w,0,g)}else x=new Uint8Array(g);let u=0;for(const w of i)x.set(w,u),u+=w.length;const f=s.length;let d;if(n.coordsBuffer)n.coordsBuffer instanceof ArrayBuffer?d=new Float32Array(n.coordsBuffer,0,f):n.coordsBuffer instanceof Float32Array?d=n.coordsBuffer.subarray(0,f):d=new Float32Array(f),d.length<f&&(d=new Float32Array(f));else if(n.pool){const w=n.pool.rent(f*4||4);d=new Float32Array(w,0,f)}else d=new Float32Array(f);return d.length>0&&d.set(s),{meta:e,keys:a,propsBuffer:x,coordsArray:d}}function tn(r,n,e,s){const i=e instanceof Float32Array?e:new Float32Array(e),l=n instanceof Uint8Array?n:n?new Uint8Array(n):new Uint8Array(0),a=new TextDecoder,p=[];for(let c=0;c<(r.length||0);c++){const g=r[c]||{},y=g.id,x={};if(Array.isArray(g.props)&&g.props.length&&s&&s.length)for(const m of g.props){const[P,b,_]=m;try{const L=l.subarray(b,b+_);x[s[P]]=JSON.parse(a.decode(L))}catch{}}const u=g.type||"Unknown";let f=g.coordsOffset||0;const d=f+(g.coordsLength||0);let w=null;if(u==="Point"){const m=i[f],P=i[f+1],b=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,_=Number.isFinite(P)?Math.max(-90,Math.min(90,P)):0;if((!Number.isFinite(m)||!Number.isFinite(P))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value",{index:c,id:y,rawX:m,rawY:P})}catch{}}w={type:"Point",coordinates:[b,_]}}else if(u==="LineString"||u==="MultiPoint"){const m=[];for(;f<d;f+=2){const P=i[f],b=i[f+1],_=Number.isFinite(P)?Math.max(-180,Math.min(180,P)):0,L=Number.isFinite(b)?Math.max(-90,Math.min(90,b)):0;if((!Number.isFinite(P)||!Number.isFinite(b))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value",{index:c,id:y,rawX:P,rawY:b})}catch{}}m.push([_,L])}w={type:u,coordinates:m}}else if(u==="Polygon"){const m=[],P=g.ringLengths||[];for(const b of P){const _=[];for(let L=0;L<b;L++){const F=i[f],E=i[f+1],k=Number.isFinite(F)?Math.max(-180,Math.min(180,F)):0,O=Number.isFinite(E)?Math.max(-90,Math.min(90,E)):0;if((!Number.isFinite(F)||!Number.isFinite(E))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value",{index:c,id:y,rawX:F,rawY:E})}catch{}}_.push([k,O]),f+=2}m.push(_)}w={type:"Polygon",coordinates:m}}else if(u==="MultiPolygon"){const m=[],P=g.polygonRingCounts||[],b=g.ringLengths||[];let _=0;for(const L of P){const F=[];for(let E=0;E<L;E++){const k=b[_++]||0,O=[];for(let U=0;U<k;U++){const C=i[f],t=i[f+1],o=Number.isFinite(C)?Math.max(-180,Math.min(180,C)):0,h=Number.isFinite(t)?Math.max(-90,Math.min(90,t)):0;if((!Number.isFinite(C)||!Number.isFinite(t))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value",{index:c,id:y,rawX:C,rawY:t})}catch{}}O.push([o,h]),f+=2}F.push(O)}m.push(F)}w={type:"MultiPolygon",coordinates:m}}else if(f<d){const m=i[f],P=i[f+1],b=Number.isFinite(m)?Math.max(-180,Math.min(180,m)):0,_=Number.isFinite(P)?Math.max(-90,Math.min(90,P)):0;if((!Number.isFinite(m)||!Number.isFinite(P))&&!N){N=!0;try{console.warn("decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value",{index:c,id:y,rawX:m,rawY:P})}catch{}}w={type:"Point",coordinates:[b,_]}}w==null&&(w={type:"Point",coordinates:[0,0]});const M=x&&typeof x=="object"?x:{};p.push({type:"Feature",id:y,geometry:w,properties:M})}return p}class Sn{constructor(n){return this.map=n.map,this.source=n.source instanceof maplibregl.VectorTileSource?n.source:this.map.getSource(n.source),this.sourceLayer=n.sourceLayer,this.fid=n.fid||"id",this.tiles=this.source.tiles.map(e=>e.split("{z}")[0]),this.tileSize=this.source.tileSize||512,this.tolerance=n.tolerance||1e-5,this.cacheSize=n.cacheSize||1e4,this.minion=new ie,this._abPool=new $,this.minion.onmessage=e=>{const s=e&&e.data;if(s)if(s.type==="geojson_bin"&&s.coords)try{const i=s.coords instanceof Uint8Array?s.coords.buffer:s.coords,l=s.propsBuf!==void 0?s.propsBuf:null,a=tn(s.meta||[],l,i,s.keys||[]);this.gjsource.setData({type:"FeatureCollection",features:a});try{l&&this._abPool.release(l instanceof ArrayBuffer?l:l.buffer)}catch{}try{i&&this._abPool.release(i instanceof ArrayBuffer?i:i.buffer)}catch{}try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch(i){console.warn("Failed to decode binary worker response",i)}else if(s.type==="geojson_diff")try{const i=s&&s.diff?s.diff:{};if(this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(i);try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process geojson diff from worker",i)}else if(s.type==="geojson_diff_bin")try{const i=s.removeList||[],l=!!s.removeAll;let a=[];if(s.add&&s.add.coords)try{const u=s.add.propsBuf!==void 0?s.add.propsBuf:null,f=s.add.coords;a=tn(s.add.meta||[],u,f,s.add.keys||[]);try{u&&this._abPool.release(u instanceof ArrayBuffer?u:u.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(u){console.warn("Failed to decode add-list from worker",u);try{this.minion.postMessage({type:"request_full"})}catch{}return}let p=[];if(s.update&&s.update.coords)try{const u=s.update.propsBuf!==void 0?s.update.propsBuf:null,f=s.update.coords;p=tn(s.update.meta||[],u,f,s.update.keys||[]);try{u&&this._abPool.release(u instanceof ArrayBuffer?u:u.buffer)}catch{}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(u){console.warn("Failed to decode update-list from worker",u);try{this.minion.postMessage({type:"request_full"})}catch{}return}let c=[];if(s.updateDiffs&&Array.isArray(s.updateDiffs))c=s.updateDiffs;else if(s.updateDiffsMeta&&Array.isArray(s.updateDiffsMeta))try{const u=s.updateKeys||[],f=s.updatePropsBuf!==void 0?s.updatePropsBuf:null,d=f?f instanceof Uint8Array?f:new Uint8Array(f):new Uint8Array(0),w=new TextDecoder;for(const M of s.updateDiffsMeta){const m={id:M.id};if(M.removeAllProperties&&(m.removeAllProperties=!0),Array.isArray(M.removeProperties)&&M.removeProperties.length&&(m.removeProperties=M.removeProperties.map(P=>u[P])),Array.isArray(M.addOrUpdate)&&M.addOrUpdate.length){const P=[];for(const b of M.addOrUpdate){const[_,L,F]=b,E=u[_];try{const k=d.subarray(L,L+F),O=JSON.parse(w.decode(k));P.push({key:E,value:O})}catch{}}P.length&&(m.addOrUpdateProperties=P)}c.push(m)}try{f&&this._abPool.release(f instanceof ArrayBuffer?f:f.buffer)}catch{}}catch(u){console.warn("Failed to decode compacted update diffs",u)}const g=new Map((p||[]).map(u=>[String(u.id),u])),y=c.map(u=>{const f={id:u.id},d=g.get(String(u.id));return d&&d.geometry&&(f.newGeometry=d.geometry),u.removeAllProperties&&(f.removeAllProperties=!0),u.removeProperties&&(f.removeProperties=u.removeProperties),u.addOrUpdateProperties&&(f.addOrUpdateProperties=u.addOrUpdateProperties),f}).filter(u=>u!=null),x={};if(l?x.removeAll=!0:i.length&&(x.remove=i),a.length&&(x.add=a),y.length&&(x.update=y),this.gjsource&&typeof this.gjsource.updateData=="function")try{this.gjsource.updateData(x);try{this.minion.postMessage({type:"diff_ack"})}catch{}}catch{try{this.minion.postMessage({type:"request_full"})}catch{}return}else{try{this.minion.postMessage({type:"request_full"})}catch{}return}}catch(i){console.warn("Failed to process binary geojson diff from worker",i)}else if(s.type==="geojson"&&s.payload)try{const i=s.payload instanceof Uint8Array?s.payload.buffer:s.payload,l=new TextDecoder().decode(i),a=JSON.parse(l);this.gjsource.setData(a)}catch(i){console.warn("Failed to decode worker response",i)}else try{this.gjsource.setData(s)}catch(i){console.warn("Failed to set worker data",i)}},this.map.addSource(this.source.id+"-proper",{type:"geojson",maxzoom:this.source.maxzoom,promoteId:this.fid,data:{}}),this.gjsource=this.map.getSource(this.source.id+"-proper"),maplibregl.addProtocol("proper",this._protocol),this.map.setTransformRequest((e,s)=>this.tiles.some(l=>e.startsWith(l))&&s==="Tile"?{url:"proper://"+e}:{url:e}),this._pendingPost=null,this._postTimer=null,this._postDelay=n.postDelay||100,this.map.on("sourcedata",e=>{if(e.sourceId===this.source.id&&e.isSourceLoaded){const s=this.map.querySourceFeatures(this.source.id,{sourceLayer:this.sourceLayer}),i=e.tile.tileID.canonical.z,l=this.tolerance*Math.pow(10,-.301*i+5.19),a={features:s.map(p=>({id:p.id,geometry:p.geometry,properties:p.properties})),tolerance:l};this._pendingPost=a,this._postTimer==null&&(this._postTimer=setTimeout(()=>{try{if(this._pendingPost)try{const{meta:p,keys:c,propsBuffer:g,coordsArray:y}=se(this._pendingPost.features||[],{pool:this._abPool});this.minion.postMessage({type:"features_bin",meta:p,keys:c,propsBuf:g.buffer,tolerance:this._pendingPost.tolerance,coords:y.buffer,cacheSize:this.cacheSize,promoteId:this.fid},[g.buffer,y.buffer])}catch{try{const c=new TextEncoder,g=Object.assign({},this._pendingPost,{promoteId:this.fid}),y=JSON.stringify(g),x=c.encode(y);this.minion.postMessage({type:"features",payload:x.buffer},[x.buffer])}catch{const g=Object.assign({},this._pendingPost,{promoteId:this.fid});this.minion.postMessage(g)}}}finally{this._pendingPost=null,this._postTimer=null}},this._postDelay))}}),this.map.refreshTiles(this.source.id),this.gjsource}_protocol=async n=>{const s=n.url.replace("proper://",""),i=n.url.split(/\/|\./i);if(i===null||i.length<4)return console.warn(`Malformed URL: ${n.url}`),{data:null};const l=await fetch(s);if(!l.ok)return console.warn(`Failed to fetch tile: ${l.statusText}`),{data:null};const a=i.length,[p,c,g]=i.slice(a-4,a-1).map(w=>w*1),y=await l.arrayBuffer(),x=new $n(new Fn(y)),u={layers:Object.entries(x.layers).reduce((w,[M,m])=>({...w,[M]:{...m,feature:P=>{const b=m.feature(P),L=b.loadGeometry().flat(1/0).some(F=>F.x>=m.extent-1||F.y>=m.extent-1||F.x<=1||F.y<=1);return b.properties.clipped=L,b}}}),{})};return{data:re(u).buffer}}}maplibregl.VectorTileSource.prototype.ProperLabels=function(r){return this._proper||(this._proper=new Sn({map:this._map,source:this})),this._proper};module.exports=Sn;
