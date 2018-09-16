(function(window, undefined){
    var njQuery=function(selector){
         return new njQuery.prototype.init(selector);
    }
    njQuery.prototype={
        constructor:njQuery,
        init:function(selector){
            /*
             1.传入 '' null undefined NaN  0  false, 返回空的jQuery对象
             2.字符串:
             代码片段:会将创建好的DOM元素存储到jQuery对象中返回
             选择器: 会将找到的所有元素存储到jQuery对象中返回
             3.数组:
             会将数组中存储的元素依次存储到jQuery对象中立返回
             4.除上述类型以外的:
             会将传入的数据存储到jQuery对象中返回
            */
            // 0.去除字符串两端的空格
            selector=njQuery.trim(selector);
            if(!selector){
                return this;
            }
            else if(njQuery.isFunction(selector)){
                njQuery.ready(selector);
            }
            else if(njQuery.isString(selector)){
                //参数为代码片段
                if(njQuery.isHtml(selector)){
                    //将代码片段插入DOM中
                    var temp=document.createElement('div');
                    temp.innerHTML=selector;
                    [].push.apply(this,temp.children);
                }
                else{
                    //参数为选择器
                    var res=document.querySelectorAll(selector);
                    [].push.apply(this,res);
                }
            }
            else if(njQuery.isArray(selector)){
                // if(
                //     // ({}).toString.call(selector)=='[object Array'
                // njQuery.isArry(selector)){
                    var arr=[].slice.call(selector);
                    [].push.apply(this,arr);
            }
            else{
                this[0]=selector;
                this.length=1;
            }
            return this;
        },

        jquery:'1.1.0',
        length:0,
        selector:'',

        push:[].push,
        slice:[].slice,
        sort:[].sort,
        toArray:function() {
            return [].slice.call(this);
        },
        get:function(num){
            //没有参数
            if(arguments.length==0){
                return this.toArray();
            }
            //参数不是负数
            if(num>=0){
                return this[num];
            }
            else{
                return this[this.length+num];
            }
        },
        eq:function(num){
            //没有参数
            if(arguments.length==0){
                return new njQuery();
            }
            else{
                return njQuery(this.get(num));
            }
        },
        first:function(){
            return this.eq(0);
        },
        last:function(){
            return this.eq(-1);
        },
        each:function(fn){
            return njQuery.each(this,fn);
        },
        map:function(fn){
            return njQuery.map(this,fn);
        }
    }

    njQuery.extend=njQuery.prototype.extend=function(obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }
    }

    //jquery的工具方法
    njQuery.extend({
        isString: function(str){
            return typeof str==='string';
        },
        isHtml: function(str){
            njQuery.trim(str);
            return str.charAt(0)==="<"&&str.charAt(str.length-1)===">"
                &&str.length>=3;
        },
        isObject:function(sele){
            return typeof sele === 'object';
        },
        isWindow: function(sele){
            return sele===window;
        },
        isArray: function(sele){
            if(njQuery.isObject(sele)&&!njQuery.isWindow(sele)&&'length' in sele){
                return true;
            }
            return false;
        },
        trim: function(str){
            if(!njQuery.isString(str)){
                return str;
            }
            if(str.trim) {
                return str.trim();
            }else{
                str.replace(/^\s+|\s+$/,'');
            }
        },
        isFunction(sele){
            return typeof sele==="function";
        },
        ready: function(fn){
            if(document.readyState==="complete"){
                fn();
            }else if(document.addEventListener){
                document.addEventListener('DOMContentLoaded',function(){
                    fn();
                });
            }else{
                document.attachEvent('onreadystatechange',function(){
                    if(document.readyState === "complete"){
                        fn();
                    }
                });
            }
        },
        each:function(obj,fn){
            //判断是否是数组
            if(njQuery.isArray(obj)){
                for(let i=0;i<obj.length;i++){
                    var res=fn.call(obj[i],i,obj[i]);
                    if(res === true){
                        continue;
                    }else if(res === false){
                        break;
                    }
                }
            }
            //判断是否是对象
            else if(njQuery.isObject(obj)){
                for(let key in obj){
                    var res=fn.call(obj[key],key,obj[key]);
                    if(res === true){
                        continue;
                    }else if(res === false){
                        break;
                    }
                }
            }
            return obj;
        },
        map:function(obj,fn){
            var res = [];
            // 1.判断是否是数组
            if(njQuery.isArray(obj)){
                for(let i = 0; i < obj.length; i++){
                    var temp = fn(obj[i], i);
                    if(temp){
                        res.push(temp);
                    }
                }
            }
            // 2.判断是否是对象
            else if(njQuery.isObject(obj)){
                for(let key in obj){
                    var temp =fn(obj[key], key);
                    if(temp){
                        res.push(temp);
                    }
                }
            }
            return res;
        },

        ajax:function(opation){
            var res=[];
            opation.data.t=new Date().getTime();//解决IE的GET方法对于同一个URL只返回第一次返回的数据的问题
            for(key in opation.data){
                var str1=encodeURIComponent(key)+'='+encodeURIComponent(opation.data[key]);
                res.push(str1);
            };

            var str = res.join('&');

            //超时处理
            var timer=setInterval(function(){
                xhr.abort();
                clearInterval(timer);
            },opation.timeout);
            var xhr=null;
            if (window.XMLHttpRequest)
            {// code for all new browsers
                xhr=new XMLHttpRequest();
            }
            else if (window.ActiveXObject)
            {// code for IE5 and IE6
                xhr=new ActiveXObject("Microsoft.XMLHTTP");
            }

            if(opation.type.toLowerCase()==='get'){
                xhr.open('get',opation.url+'?'+str,true);
                xhr.send();
            }else{
                xhr.open('post',opation.url,true);
                xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                xhr.send(str);
            }

            xhr.onreadystatechange=function(){
                if(xhr.readyState===4){
                    clearInterval(timer);
                    if(xhr.status>=200&&xhr.status<300||xhr.status===304){
                        opation.success(xhr);
                    }else{
                        opation.error(xhr);
                    }
                }
            }
            return this;
        }

    })


    //DOM相关方法
    njQuery.prototype.extend({
        empty:function(){
           this.each(function(index,value){
               value.innerHTML='';
           }) ;
           return this;
        },
        remove:function (sele){
            if(arguments.length===0){
                this.each(function(index,value){
                    var parent=value.parentNode;
                    parent.removeChild(value);
                })
            }
            else{
                var $this=this;
                $(sele).each(function(key,value){
                    var type=value.tagName;
                    $this.each(function(k,val){
                        var t=val.tagName;
                        if(t===type){
                            var parent=value.parentNode;
                            parent.removeChild(val);
                        }
                    });
                });
            }
            return this;
        },

    })


    
    
    njQuery.prototype.init.prototype=njQuery.prototype;
    window.njQuery=window.$=njQuery;
    
    
})(window);