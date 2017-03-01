const classPrePendString  = '';	// define you  pre-pend string here
const classPostPendString = '';	// define your post-pend string here

(function(classPrePend,classPostPend) {
   "use strict";
   var argsToString, $pend;
   
   const prohibitedChar = /[\s\b|]+/g;	// prohibited by this code

   // 'classPrePend' and 'classPostPend' is a optional string with which ALL class tokens entering herein 
   //  will be pre-pended or post-pended, respectively
   classPrePend  = (classPrePend  || '').replace(prohibitedChar,'');	// remove all prohibited characters
   classPostPend = (classPostPend || '').replace(prohibitedChar,'');	
   const template = classPrePend+"__##__"+classPostPend;	// create a constant template for prepending classname

   if ( classPrePend || classPostPend ) {
      $pend        = function(str) { return str.replace(/\b[^\s]+\b/g,function(s){return template.replace('__##__',s)})  };
      argsToString = function(arg) { return String.trim( $pend([].concat.apply([],arg).join(' ')) ); };
   } else
      argsToString = function(arg) { return String.trim([].concat.apply([],arg).join(' '));           };

   // 'arg' is an 'arguments' object (an array of strings) from another function
   const argsToArray   = function(arg) { var str = argsToString(arg); return str ? str.split(/\s+/g):[]; };
   var upgradeDOMTokenList = function() {

      const _add      = DOMTokenList.prototype.add;
      const _remove   = DOMTokenList.prototype.remove;
      const _toggle   = DOMTokenList.prototype.toggle;
      const _contains = DOMTokenList.prototype.contains;

      // use a SVG as test element, IE does not have classList for this item
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "svg").classList;
      probe.add('a','b');   // use multi-arg to verify vintage of DOMTokenList

      if (probe.contains('b')) {
         DOMTokenList.prototype.add = function(str) {
            const list = argsToArray(arguments);
            if (list.length) return _add.apply(this,list)
         };

         DOMTokenList.prototype.remove = function(str) {
            const list = argsToArray(arguments);
            if (list.length) return _remove.apply(this,list);
         };
      } else {
         DOMTokenList.prototype.add = function(args){
            const list = argsToArray(arguments);  // combine all arguments (except first) into array   
            for (var i=0,I=list.length; i<I; i++)
               _add.call(this,list[i]);
         };
         DOMTokenList.prototype.remove = function(args) {
            const list = argsToArray(arguments);  // combine all arguments (except first) into array   
            for (var i=0,I=list.length; i<I; i++)
               _remove.call(this,list[i]);
         };
      };

      if ( classPrePend || classPostPend ) 
         DOMTokenList.prototype.contains = function(arg) {
            return _contains.call(this,$pend(String.trim(arg)));
         };

      DOMTokenList.prototype.replace = function(arg1,arg2) {
         this.remove(arg1);
         this.add(arg2);
      };

      DOMTokenList.prototype.toggle = function(arg1,arg2) {
         if (arg2 == null) 
            return _toggle.call(this,$pend(String.trim(arg1)));
         if (typeof arg2 == 'string')   // if both arg string, if arg1 or arg2 is present, swap
                 if (this.contains(arg1)) return ((this.replace(arg1,arg2)) || 2);   // return 2 (second arg)
            else if (this.contains(arg2)) return ((this.replace(arg2,arg1)) || 1);   // return 1 (first arg)
            else return 0;   // return 0 (no args found, no toggle occured)
         else   // if arg2 == true, add arg1 else remove arg1, return if arg1 is present at end of operation
            return arg2 ? ( this.add(arg1) || true ) : ( this.remove(arg1) || false );
      };
   }; // upgradeDOMTokenList

   //  function to extend (or over-write) Element.prototype with classList
   function createClassList() {

      function _replace (oldClass,newClass) {
         oldClass = String.trim(oldClass+' '+newClass); // add newClass to oldClass search (to prevent duplicates)
         oldClass = new RegExp('\\b('+oldClass.replace(/\s+/g,'|')+')\\b','gi');
         this.className = String.trim((this.className.replace(oldClass,'')+' '+newClass).replace(/\s\s+/g,' '));
      };

      $pend = $pend || function(arg) { return arg; };

      var getter = {};
      getter.get = function(){
            const my = this;
            return {  // this is probably not most efficient, but IE sucks, so don't care
               item    : function(i)    { return String.trim(my.className).split(/\s+/g)[i]                            },
               contains: function(arg)  { return (RegExp('\\b'+ $pend(String.trim(arg)) +'\\b')).test(my.className);   },

               add     : function(args) { _replace.call(my, '', argsToString(arguments) );  },
               remove  : function(args) { _replace.call(my, argsToString(arguments), '' );  },

               replace : function(arg1,arg2) { 
               			arg1 = $pend( String.trim(arg1) );
               			arg2 = $pend( String.trim(arg2) );
               			_replace.call(my, arg1, arg2);
               		},

               toggle    : function(arg1,arg2) { 
                     if (arg2 == null) 
                        return this.contains(arg1) ? (this.remove(arg1)||false) : (this.add(arg1)||true);
                     if (typeof arg2 == 'string')   // if both arg string, if arg1 or arg2 is present, swap
                             if (this.contains(arg1)) return ( this.replace(arg1,arg2) || 2 );  // return 2 (second arg)
                        else if (this.contains(arg2)) return ( this.replace(arg2,arg1) || 1 );  // return 1 (first arg)
                        else return 0;   // return 0 (no args found, no toggle occured)
                     else   // if arg2 == true, add arg1 else remove arg1, return if arg1 is present at end of operation
                        return arg2 ? ( this.add(arg1) || true ) : ( this.remove(arg1) || false );
                  }
            };
         };   // getter.get

      if ( Object.defineProperty)
         Object.defineProperty(Element.prototype,'classList',getter);
      else
         Element.prototype.__defineGetter__('classList',getter.get);
   };   //  createClassList

   try {             // attempt to upgrade DOMTokenList .add, .remove and .replace methods
      upgradeDOMTokenList();  
   } catch (err) {   // if fail, add/override Element.prototype.classList
      console.log(err);
      console.warn('Hey dummy, consider getting rid of this browser!');         
      createClassList();      
   };

   upgradeDOMTokenList = null;
   createClassList = null;

})(classPrePendString,classPostPendString)
