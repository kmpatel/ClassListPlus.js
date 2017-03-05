var classListConfig = classListConfig || {};

classListConfig = {
  name         : 'class list',   // define name of the improved classList, 
  nameDecorate : {
    pre  : 'this-is-my-app-',    // define you  pre-pend string here
    post : '-class',             // define your post-pend string here
  },
};
                  
(function(cfg) {
   "use strict";
   
  //  ------------------------------------------- primary function -----------------------------------------// 

   function emulateDOMTokenList(element) {

    const   _cycle = function(args) {  
        let   i    = 0; 
        const I    = args.length;
        const values = undecorate(this.value);

        while ( !RegExp("\\b"+args[i]+"\\b").test(values) && i < I ) i++; 
        if ( i == I ) return -1;
        const j = ( i + 1 ) % I;
        return (this.replace(args[i],args[j]) || j);
     };

     const   _toggle = function(arg1,arg2) {
        if ( rgx2words.test(arg1) || typeof arg2 == 'string' )
          return _cycle.call(this, _toArray(arguments));

        if ( (arg2 == null && this.contains(arg1)) || (arg2 != null && !arg2) )
          return this.remove(arg1) || false;
        else
          return this.add(arg1) || true ;
     };

     const  _replace = function(oldClass,newClass) { 
        oldClass     = decorate( oldClass       );
        newClass     = decorate( ' ' + newClass );
        oldClass     = (oldClass+newClass).trim().replace(rgxSpaces,'|'); 
        oldClass     = new RegExp('\\b('+oldClass+')\\b\\s*','g');
        const cName  = this.value.replace(oldClass,'');
        this.value   = cName+newClass;  // this.value (setValue) will clean/decorate
      };

     const      _add = function(args) { this.replace( '', _toString(arguments))                     };
     const   _remove = function(args) { this.replace( _toString(arguments), '')                     };
     const _contains = function(arg)  { return RegExp('\\b'+decorate(arg)+'\\b').test(this.value);  };
     const     _item = function(i)    { return undecorate(this.value.trim().split(rgxSpaces)[i]);   };
  
     function ClassListMethods(_classList) {};
     ClassListMethods.prototype.add      = _add;
     ClassListMethods.prototype.remove   = _remove;
     ClassListMethods.prototype.contains = _contains;
     ClassListMethods.prototype.item     = _item;
     ClassListMethods.prototype.replace  = _replace;
     ClassListMethods.prototype.toggle   = _toggle;

     // ClassListValue actually get/set class attribute & foundational to ClassListMethods, 
     // prohibit re-configuration
     function ClassListValue(myElement) {
        this.set = function (arg) { myElement.className  = arg.trim(); };
        this.get = function ()    { return myElement.className         };
        this.configurable = false;
     }

     // create a cache of classlists, if possible retrive a requested classlist instead of generate
     const cache = new (function() {
             var lastElem  = null;
             var lastList  = null;
             this.contains = function(elem)      { return (elem == lastElem);                   };
             this.get      = function(elem)      { return (elem == lastElem) ? lastList : null; };
             this.put      = function(elem,list) { lastElem = elem; lastList = list;            };
         })();

     // getter/setter for the element.classList (or whatever the choosen name is, per cfg.name)
     //  "this" in these getter/setter point to the DOM element

     const  classListPlus = {
          enumerable   : false,
          configurable : false,

          set : function(arg) { this[cfg.name].value = decorate(arg); },

          get : function()    {
                if (cache.contains(this)) return cache.get(this);

                const methods = new ClassListMethods(); 
                defineGetSet(methods, 'value' , new ClassListValue(this));
                cache.put(this,methods);
                return methods;
              },
      };

     // add this 'classListPlus' property to Element.prototype
     defineGetSet( Element.prototype, cfg.name || 'classList', classListPlus );  
   };

  function fixConfiguration() {

    const fixClassName  = function(name) { return (name || '').trim().replace(/[-\s|]+/g   ,'-'          ) };
    const camelizeName  = function(name) { return (name || '').trim().replace(/[-\s|]+(.)/g, _helpCamlize) };
    const _helpCamlize  = function(s,m)  { return m.toUpperCase();                                         };

    // prepare cfg.nameDecorate
    if ( cfg.nameDecorate ) {   // determine the configuration for name decoration
      cfg.nameDecorate.pre  = fixClassName(cfg.nameDecorate.pre);
      cfg.nameDecorate.post = fixClassName(cfg.nameDecorate.post);

      if (!(cfg.nameDecorate.pre+cfg.nameDecorate.post)) cfg.nameDecorate = null;
    };

    // camelize cfg.gname (if necessary)
    const _name = cfg.name || 'classList';
    cfg.name = camelizeName( _name );
    if (_name != cfg.name) console.warn('Provided name "'+_name+'" is malformed, using "'+cfg.name+'" instead');

  };

//  ------------------------------------------- helper functions ---------------------------------------------- //   

  // getter/setter helper
  const defineGetSet = Object.defineProperty || function(obj,name,property) { 
               if (property.get) obj.__defineGetter__(name,property.get);
               if (property.set) obj.__defineSetter__(name,property.set);
            };

  // helper RegExp
  const  rgxSpaces  = /\s+/g;           // all whitespace Regexp
  const  rgx2words  = /[^\s]\s+[^\s]/;  // find two words
  const    rgxWord  = /\b([^\s]+)\b/g;  // whole word RegExp

  // arguments parsing helpers 
  const     _concat = Array.prototype.concat.bind([]);
  const   _toString = function(args) { return _concat.apply(null,args).join(' ').trim();      };
  const    _toArray = function(args) { return (args = _toString(args)) && args.split(rgxSpaces); };
  
  // class name decoration
  const   classPre  = cfg.nameDecorate ? cfg.nameDecorate.pre  : '';
  const   classPost = cfg.nameDecorate ? cfg.nameDecorate.post : '';

  const rgxDecorate = cfg.nameDecorate &&    new RegExp ( '\\b'+classPre+'([^\\s]+)'+classPost+'\\b', 'g'        );
  const hlpDecorate = classPre+'$1'+classPost;

  const    decorate = cfg.nameDecorate 
                      ? function(str) { return str.replace(rgxWord, hlpDecorate);  }
                      : function(str) { return str };
  const  undecorate = cfg.nameDecorate 
                      ? function(str) { return str.replace(rgxDecorate,"\$1")      }
                      : function(str) { return str };
                      
//  ---------------------------------------- do the actual work of make ClassListPlus ---------------------------//   
   fixConfiguration();
   emulateDOMTokenList(); 

})(classListConfig);
