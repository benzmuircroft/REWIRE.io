`IMPORTANT`;
`A bug with the end commented out will never be in live mode unless it is a live bug to begin with, also remember that things like the db don't save in tests`;

function ln(caller,line){
    var script='BUG.js:';
    return caller+' @'+(((new Error(caller)).stack+script+':'+script+':').split(script)[(line||2)]).split(':')[0];
    };
function log(){
    script='BUG.js:';
    var a=Object.values(arguments);
    if(a.length==1){a=a[0];}
    var b=' @'+(((new Error(a)).stack+script+':'+script+':').split(script)[2]).split(':')[0];
    console.log([a,b]);
    return;
    }
var EMPTY={NET:'live'};
var GUB=module.exports={
    G:'PLEASE IMPORT'
,   fs:'PLEASE IMPORT'
,   LOG_LEVEL:0
,   HAS_HISTORY_FOLDER:false
,   PAINTER:undefined//alows to track which BUG was last succesful to pass through a db.wait
/*  EXAMPLE:
if(!db.block[F.order]['events']){//store the last sucessful BUG to pass through here
    G.BUG.PAINTER=copy(BUG.FILENAME);
    }
*/
,   LAST:{
        info:'to use this you need the opt "onqueue:name" in the new bug. then the db will copy the last bug through if wait fails into the current bug if it is being stored. you must store it manually after wait like G.BUG.LAST[name]=BUG'
        }
,   NEW:function(env,ARG,trace,opts,cockpit_route){
        if(opts!==undefined&&typeof opts!=='object'){log('BUG opts are malformed',opts,trace);}
        if(!opts){
            opts={dir:''};
            }
        else if(!opts.dir){
            opts.dir='';
            }
        if(opts.dir&&opts.dir!==''&&opts.dir[opts.dir.length-1]!=='/'){//   asafe/
            opts.dir=opts.dir+'/';
            }
        var BUG={
            CALLER:                 opts.desc||''
        ,   LOCKED:function(BUG,F,_id){
                BUG.LOCKLIST[''+BUG.NET+'/'+F+'/'+_id+'']=[BUG.NET,F,_id];
                return;
                }
        ,   LIVE:                   'live'//shows developer intent to pay special consideration to things that must be taken/copied from the main network (dispite a test env)
        ,   NET:                    (env=='temp'?G.CODE.encrypt(+new Date()):'live')//or test/live
        ,   STEPS:                  undefined
        ,   ARGUMENTS:              ARG||{}
        ,   LOCKLIST:               {}
        ,   AUDIT:                  []
        ,   EVENTS:                 []
        ,   INDEX:                  {live:{}}
        ,   BEFORE:                 {live:{}}
        ,   ORIGIN:                 trace.replace('Error','Started At').split(/\n/g)
        ,   EXITED:                 '... happens at bug end'
        ,   HISTORY:                ((opts||{}).hist?((ARG.o||{})._id||false):false)//???
        ,   TEST_ONLY:              (opts||{}).test_only
        ,   MEM:                    {}//memory temp-through-live
        ,   FILENAME:               opts.dir+G.ts()+'.__'+G.CODE.encrypt(+new Date())+'.json'
        ,   START:                  (+new Date())
        ,   TIME:                   (+new Date())+(60000*5)//alowed to last
        ,   OPTS:                   opts
        ,   ACTIVE:                 true
            };
        if(cockpit_route){BUG.COCKPIT=cockpit_route.split('.')[1];}
        BUG.PUSH=function(audit){
            if(global.TESTING){console.log(audit);}
            else if(GUB.LOG_LEVEL){log(audit);}
            BUG.AUDIT.push(audit);
            return;
            };
        BUG.EV=function(ev){
            if(BUG.NET=='live'){
                BUG.EVENTS=BUG.EVENTS.concat([ev]);
                }
            return;
            };
        if(BUG.NET!=='live'){
            BUG.INDEX[BUG.NET]={};
            BUG.BEFORE[BUG.NET]={};
            }
        BUG.STEPS=({temp:[BUG.NET,'live'],live:['live']})[env];
        if(!BUG.STEPS){
            BUG.STEPS=[env+1,'stop'];//i intentionally pass an already running temptest (wanting to only perform one cycle)
            }
        if(G.db[BUG.NET]==undefined){//if net not live/test then create db.temp
            G.db[BUG.NET]={};
            for(var k in G.db['live']){
                G.db[BUG.NET][k]={};
                }
            }
        if(BUG.ARGUMENTS){BUG.ARGUMENTS.cb='cb';}
        BUG.timeout=setInterval(function(BUG){
            if((+new Date())>BUG.TIME){
                BUG.WARNING={stack:'BUG LASTED TOO LONG!'};
                clearInterval(BUG.timeout);
                delete BUG.timeout;
                GUB.END(BUG,{stack:'timeout'},function(){
                    //dev needs to fix (or //todo: shutdown)
                    });
                }
            else{times=avg=i=undefined;}
            },10000,BUG);
        return BUG;
        }
,   END:function(BUG,ERROR,cb,INSPECT){
        if((BUG.STEPS||[]).length>1&&BUG.STEPS[0]!=='live'){delete G.db[BUG.STEPS[0]];}
        clearInterval(BUG.timeout);
        delete BUG.timeout;
        var EXIT=new Error().stack.replace('Error','Exited At').split(/\n/g);
        if(!BUG){
            if(ERROR){
                var x;
                if(G.coin){
                    x=__dirname+'/../'+(G.coin.toUpperCase())+'/BUGS/';
                    }
                else{
                    x=__dirname+'/../SETTINGS/BUGS/';
                    }
                fs.writeFileSync(x+(+new Date())+'.NOBUG',ERROR.stack,'utf-8');
                var HEADER={type:'BUG',state:'UNDEFINED'};
                fs.writeFile(G.gub_log_location+'/'+G.CODE.encrypt(+new Date())+'.gub',G.SAFE.stringify([{type:'BUG'},[HEADER,{stack:(typeof ERROR.stack=='string')?ERROR.stack.split(/\n/g):ERROR}]]),'utf-8',function(){});
                }
            if(typeof cb=='function'){cb();}
            }
        else if(BUG.ACTIVE){
            if(BUG.ONCE){
                cb(BUG);
                }
            else{
                if(BUG.NET=='live'){BUG.ONCE=true;}
                BUG.EXITED=EXIT;
                if(BUG.NET!=='live'){
                    BUG.AUDIT.push('[TEST END]');
                    }
                else if(BUG.NET=='live'){
                    var compare=JSON.parse(JSON.stringify(BUG.AUDIT));
                    compare=[compare.slice(0,compare.indexOf(';')),compare.slice(compare.indexOf(';')+1)];
                    if(compare[0].length>compare[1].length){
                        compare='BUG TEST WAS LONGER THAN LIVE (IS TEST ALTERING SOMETHING?)';
                        log(compare);
                        BUG.AUDIT.push(compare);
                        }
                    }
                if(INSPECT){
                    log('BUG.END '+BUG.NET);
                    }
                if(BUG.TEST_ONLY){
                    if(!BUG.ERROR){BUG.ERROR='TEST ONLY';}
                    else{BUG.ERROR+='... (was) TEST ONLY';}
                    }
                if(BUG.FILENAME==undefined){log('BUG BECOMES EMPTY!');}
                if(ERROR){
                    BUG.ERROR=(typeof ERROR.stack=='string')?ERROR.stack.split(/\n/g):ERROR;
                    }
                if((BUG.STEPS||['live'])[0]!=='live'&&BUG.NET!=='live'&&!BUG.ERROR&&BUG.STEPS.indexOf('stop')==-1){
                    if(INSPECT){log('BUG.END switching to live');}
                    BUG.timeout=setInterval(function(BUG){
                        if((+new Date())>BUG.TIME){
                            BUG.WARNING={stack:'BUG LASTED TOO LONG!'};
                            clearInterval(BUG.timeout);
                            delete BUG.timeout;
                            GUB.END(BUG,{stack:'timeout'},function(){
                                //dev needs to fix (or //todo: shutdown)
                                });
                            }
                        else{times=avg=i=undefined;}
                        },10000,BUG);
                    BUG.NET='live';
                    BUG.EXEC(BUG);
                    }
                else{
                    BUG.ACTIVE='ending';
                    if(INSPECT){log('BUG.END ending live');}
                    function before_cb(BUG){
                        if(INSPECT){log('BUG.END before_cb');}
                        before_cb=undefined;
                        '===============================================================================================================================';
                        '=================================================== OUT LOG EACH BUG REPORT ===================================================';
                        '===============================================================================================================================';
                        var HEADER={
                            type:   'BUG'
                        ,   state:  (BUG.ERROR?'ERROR':'SUCCESS')
                            };
                        if(HEADER.state=='ERROR'&&BUG.RECOVER_ERROR!=='NO ERROR (SUCCESSFULLY REVERSED)'){
                            HEADER.state='ALERT';
                            }
                        if((!BUG.OPTS.nolog||HEADER.state=='ERROR'||GUB.LOG_LEVEL==1)&&BUG.SILENT==undefined){
                            if(INSPECT){log('happens 1??');}
                            var f=G.CODE.encrypt(+new Date())+`.`+G.coin;
                            var where='/home/host/msg/relay/';
                            fs.writeFile(where+'_'+f,G.SAFE.stringify({coin:G.coin,r:[HEADER,BUG]},null,4),'utf-8',function(e){if(!e){fs.open(where+'_'+f,'r',function(e,fd){fs.fsync(fd,function(){fs.close(fd,function(){});G.shell.exec(`mv `+where+`_`+f+` `+where+f+`; find `+where+`*.`+G.coin+` -type f -mmin +0.15 -exec rm -f {} +`);});});}});
                            //G.shell.exec(`(echo "`+(G.utf8.en(G.SAFE.stringify({coin:G.coin,r:[HEADER,BUG]})))+`" > `+G.gub_log_location+`/`+f+`) & wait && echo `+f+` | socat - UNIX-CONNECT:`+G.gub_log_location+`.sock`);
                            global.L.log(BUG);//rotating log files
                            }
                        if(INSPECT){log('happens 2??');}
                        if(BUG.ERROR=='ERROR'){
                            var d=+new Date();
                            if(G.coin=='faucex'){//in faucex
                                var coin=(JSON.stringify(BUG).split('coin":"')[1]||'').split('\"')[0];
                                if(coin){
                                    var s;
                                    for(var i=0;i<G.SETTINGS.pis.length;i+=1){if(G.SETTINGS.pis[i].indexOf(coin)!==-1){s=i;break;}}
                                    if(s!==undefined){
                                        var f=G.CODE.encrypt(+new Date())+`.`+coin;
                                        var where='/home/host/msg/relay/';
                                        fs.writeFile(where+'_'+f,G.SAFE.stringify({filename:BUG.FILENAME},null,4),'utf-8',function(e){if(!e){fs.open(where+'_'+f,'r',function(e,fd){fs.fsync(fd,function(){fs.close(fd,function(){});G.shell.exec(`mv `+where+`_`+f+` `+where+f+`; find `+where+`*.`+coin+` -type f -mmin +0.15 -exec rm -f {} +`);});});}});
                                        //try{G.shell.exec(`ssh root@s`+s+`.faucex.cc '(echo "`+(G.aes.en(JSON.stringify({filename:BUG.FILENAME})))+`" > /home/input/make-bug`+d+`.`+G.coin+`;echo "make-bug`+d+`.`+G.coin+`" | socat - UNIX-CONNECT:/home/`+coin+`.sock 2>/dev/null); exit'`);}catch(e){}
                                        }
                                    }
                                }
                            else{
                                if(INSPECT){log('writing BUG to relay');}
                                var f=G.CODE.encrypt(+new Date())+`.`+coin;
                                var where='/home/host/msg/relay/';
                                fs.writeFile(where+'_'+f,G.SAFE.stringify({filename:BUG.FILENAME},null,4),'utf-8',function(e){if(!e){fs.open(where+'_'+f,'r',function(e,fd){fs.fsync(fd,function(){fs.close(fd,function(){});G.shell.exec(`mv `+where+`_`+f+` `+where+f+`; find `+where+`*.`+coin+` -type f -mmin +0.15 -exec rm -f {} +`);});});}});
                                //try{G.shell.exec(`ssh root@faucex.cc '(echo "`+(G.aes.en(JSON.stringify({filename:BUG.FILENAME})))+`" > /home/input/make-bug`+d+`.`+G.coin+`;echo "make-bug`+d+`.`+G.coin+`" | socat - UNIX-CONNECT:/home/faucex.sock 2>/dev/null); exit'`);}catch(e){}
                                }
                            }
                        '===============================================================================================================================';
                        '=================================================== OUT LOG EACH BUG REPORT ===================================================';
                        '============================================================================================================================END';
                        if(GUB.PAINTER==BUG.FILENAME){
                            if(INSPECT){log('BUG.END painter');}
                            if(INSPECT){log('BUG.END (on success)');}
                            fs.writeFile(__dirname+'/../SETTINGS/BUGS/'+BUG.OPTS.dir+'PAINTED.json',G.SAFE.stringify(BUG,undefined,'\t'),function(){
                                HEADER=undefined;
                                delete BUG.ACTIVE;
                                cb(BUG);
                                });
                            }
                        else{
                            if(INSPECT){log('cb?');}
                            HEADER=undefined;
                            delete BUG.ACTIVE;
                            cb(BUG);
                            }
                        }//before_cb
                    if((BUG.ARGUMENTS||{}).pw){BUG.ARGUMENTS.pw='xxx';}
                    if((BUG.ARGUMENTS||{}).password){BUG.ARGUMENTS.password='xxx';}
                    if(((BUG.ARGUMENTS||{})['0']||{}).password){BUG.ARGUMENTS['0'].password='xxx';}
                    if(((BUG.ARGUMENTS||{})['0']||{}).pw){BUG.ARGUMENTS['0'].pw='xxx';}
                    BUG={
                        CALLER:                 BUG.CALLER||''
                    ,   NET:                    BUG.NET
                    ,   ARGUMENTS:              BUG.ARGUMENTS||{}
                    ,   LOCKLIST:               BUG.LOCKLIST||{}
                    ,   AUDIT:                  BUG.AUDIT||[]
                    ,   EVENTS:                 BUG.EVENTS||[]
                    ,   ERROR:                  BUG.ERROR||undefined
                    ,   WARNING:                BUG.WARNING
                    ,   ORIGIN:                 (BUG.ORIGIN||'')//dont split this it will cause error
                    ,   EXITED:                 BUG.EXITED
                    ,   INDEX:                  BUG.INDEX//gets used then gets deleted
                    ,   BEFORE:                 BUG.BEFORE
                    ,   BEFORE_ERROR:           undefined
                    ,   RESULT:                 {[(BUG.STEPS||[])[0]]:{},live:{}}
                    ,   INNER_BUG:              BUG.INNER_BUG
                    ,   OUTER_BUG:              BUG.OUTER_BUG
                    ,   EX_LOG:                 (BUG.EX_LOG||[])//custom for faucex exchange reversal
                    ,   MN_SUMTOTAL:            (BUG.MN_SUMTOTAL||[])//custom for mn on_tx reversal of funds added
                    ,   FILENAME:               BUG.FILENAME||(G.ts()+'.__'+G.CODE.encrypt(+new Date())+'.json')
                    ,   ONCE:                   true
                    ,   DURATION:               (+new Date())-BUG.START
                    ,   DATE:                   (+new Date())
                    ,   OPTS:                   BUG.OPTS
                    ,   LAST:                   GUB.LAST[BUG.OPTS.last]
                    ,   ACTIVE:                 BUG.ACTIVE
                    ,   COCKPIT:                BUG.COCKPIT||undefined
                    ,   SILENT:                 BUG.SILENT//don't log to cockpit?
                        };
                    if(INSPECT){log('BUG.END object rebuilt');}
                    if(!BUG.INNER_BUG){
                        delete BUG.INNER_BUG;
                        }
                    else{
                        BUG.INNER_BUG.ERROR=BUG.INNER_BUG.ERROR.split(/\n/g);
                        BUG.INNER_BUG.ORIGIN=BUG.INNER_BUG.ORIGIN.split(/\n/g);
                        }
                    if(INSPECT){log('BUG.END error origin');}
                    if(!BUG.OUTER_BUG){
                        delete BUG.OUTER_BUG;
                        }
                    else{
                        BUG.OUTER_BUG.ERROR=BUG.OUTER_BUG.ERROR.split(/\n/g);
                        BUG.OUTER_BUG.ORIGIN=BUG.OUTER_BUG.ORIGIN.split(/\n/g);
                        }
                    if(INSPECT){log('BUG.END inner outer');}
                    for(var item in BUG.INDEX['live']){
                        BUG.RESULT['live'][item]=JSON.parse(G.SAFE.stringify(G.db['live'][item.split('/')[0]][item.split('/')[1]]||{deleted:true}));
                        }
                    if(INSPECT){log('BUG.END done network item loop');}
                    delete BUG.INDEX;
                    if(BUG.ERROR){//fail
                        if(INSPECT){log('BUG.END (on fail)');}
                        log('BUG FOUND: Reverting ... ',Object.values(BUG.LOCKLIST||{}));
                        try{
                            for(var i=0;i<BUG.EX_LOG.length;i+=1){//live changes only were logged here
                                if(BUG.EX_LOG[i][0]=='added'){
                                    delete G.ex['live'][BUG.EX_LOG[i][1]].each[BUG.EX_LOG[i][2]];
                                    G.ex['live'][BUG.EX_LOG[i][1]].totals=G.cc.sub(G.ex['live'][BUG.EX_LOG[i][1]].totals,BUG.EX_LOG[i][3]);
                                    }
                                else if(BUG.EX_LOG[i][0]=='deleted'){
                                    G.ex['live'][BUG.EX_LOG[i][1]].each[BUG.EX_LOG[i][2]]=BUG.EX_LOG[i][2];
                                    G.ex['live'][BUG.EX_LOG[i][1]].totals=G.cc.add(G.ex['live'][BUG.EX_LOG[i][1]].totals,BUG.EX_LOG[i][3]);
                                    }
                                else if(BUG.EX_LOG[i][0]=='subtracted'){
                                    G.ex['live'][BUG.EX_LOG[i][1]].totals=G.cc.add(G.ex['live'][BUG.EX_LOG[i][1]].totals,BUG.EX_LOG[i][3]);
                                    }
                                }
                            if(INSPECT){log('BUG.END done G.ex loop (on fail)');}
                            for(var i=0,l=BUG.MN_SUMTOTAL.length;i<l;i+=1){
                                if(BUG.MN_SUMTOTAL[i][0]=='add'){G.SUMTOTAL(EMPTY,'sub',BUG.MN_SUMTOTAL[i][1]);}
                                else{G.SUMTOTAL(EMPTY,'add',BUG.MN_SUMTOTAL[i][1]);}
                                }
                            if(INSPECT){log('BUG.END done sum total loop (on fail)');}
                            function ___LOCKLIST(i,keys){
                                if(keys&&BUG.LOCKLIST[keys[i]]){
                                    if(G.db.que[BUG.LOCKLIST[keys[i]][0]]){
                                        var q=-1;
                                        for(q=0;q<(G.db.que[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]]||[]).length;q+=1){
                                            if((G.db.que[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]][q][2]||{}).FILENAME==BUG.FILENAME){
                                                break;
                                                }
                                            }
                                        if(q>-1){
                                            G.db.que[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]].splice(q,1);//clean blockage in the items que if it's there
                                            }
                                        }
                                    if(keys&&BUG.LOCKLIST[keys[i]][0]!=='live'){//ignore temp things that have already been deleted when the temp env got nuked
                                        try{delete (G.db.debug[BUG.LOCKLIST[keys[i]][0]]||{})[BUG.LOCKLIST[keys[i]][1]];}catch(e){}
                                        try{delete (G.db.block[BUG.LOCKLIST[keys[i]][0]]||{})[BUG.LOCKLIST[keys[i]][1]];}catch(e){}//temp uses the same as live
                                        try{delete (G.db.prevent[BUG.LOCKLIST[keys[i]][0]]||{})[BUG.LOCKLIST[keys[i]][1]];}catch(e){}
                                        try{delete (G.db.saver[BUG.LOCKLIST[keys[i]][0]]||{})[BUG.LOCKLIST[keys[i]][1]];}catch(e){}
                                        ___LOCKLIST(i+1,keys);
                                        }
                                    else if((G.db[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]]||{})[BUG.LOCKLIST[keys[i]][2]]==undefined){//not in the db
                                        try{delete G.db.debug[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]];}catch(e){}//just in case free up db mem leaks
                                        try{delete G.db.block[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]];}catch(e){}
                                        try{delete G.db.prevent[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]];}catch(e){}
                                        try{delete G.db.saver[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]];}catch(e){}
                                        ___LOCKLIST(i+1,keys);s
                                        }
                                    else if(BUG.BEFORE[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]+'/'+BUG.LOCKLIST[keys[i]][2]]==undefined){//is in the db but wasn't before
                                        G.db.del({NET:BUG.LOCKLIST[keys[i]][0]},BUG.LOCKLIST[keys[i]][1],BUG.LOCKLIST[keys[i]][2],ln('delete live on bug revert because it did not exist before bug'),function(){
                                            ___LOCKLIST(i+1,keys);
                                            });
                                        }
                                    else{//revert live!
                                        G.db[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]][BUG.LOCKLIST[keys[i]][2]]=G.copy(BUG.BEFORE[BUG.LOCKLIST[keys[i]][0]][BUG.LOCKLIST[keys[i]][1]+'/'+BUG.LOCKLIST[keys[i]][2]]);
                                        G.db.rec({NET:BUG.LOCKLIST[keys[i]][0]},BUG.LOCKLIST[keys[i]][1],BUG.LOCKLIST[keys[i]][2],ln('revert per bug.locklist'),function(){
                                            ___LOCKLIST(i+1,keys);
                                            });
                                        }
                                    }
                                else{//end
                                    if(INSPECT){log('BUG.END locklist end (on fail)');}
                                    ___LOCKLIST=keys=undefined;
                                    if(BUG.RESULT&&BUG.RESULT.live){
                                        ___REVERT(0,Object.keys(BUG.RESULT.live));//start 2
                                        }
                                    else{
                                        ___REVERT=undefined;
                                        throw new Error('::SUCCESS;;');
                                        }
                                    }
                                }//___LOCKLIST
                            function ___REVERT(i,keys){
                                if(BUG.RESULT.live[keys[i]]){
                                    if(BUG.RESULT.live[keys[i]]&&BUG.BEFORE.live[keys[i]]){
                                        keys[i]=[keys[i].split('/'),keys[i]];
                                        G.db['live'][keys[i][0][0]][keys[i][0][1]]=BUG.BEFORE.live[keys[i][1]];
                                        G.db.rec({NET:'live'},keys[i][0][0],keys[i][0][1],ln('revert per bug.before'),function(){
                                            ___REVERT(i+1,keys);
                                            });
                                        }
                                    else{
                                        keys[i]=keys[i].split('/');
                                        if(G.db['live'][keys[i][0]][keys[i][1]]){
                                            G.db.del({NET:'live'},keys[i][0],keys[i][1],ln('delete newly created item that exists in bug.result but not bug.before'),function(){
                                                ___REVERT(i+1,keys);
                                                });
                                            }
                                        else{___REVERT(i+1,keys);}
                                        }
                                    }
                                else{//end
                                    ___REVERT=undefined;
                                    throw new Error('::SUCCESS;;');
                                    }
                                }//___REVERT
                            ___LOCKLIST(0,Object.keys(BUG.LOCKLIST||{}));//start 1
                            }
                        catch(RECOVER_ERROR){
                            if(INSPECT){log('BUG.END (on fail) catch');}
                            if(RECOVER_ERROR.stack.indexOf('::SUCCESS;;')==-1){BUG.RECOVER_ERROR=(typeof RECOVER_ERROR.stack=='string')?RECOVER_ERROR.stack.split(/\n/g):RECOVER_ERROR;}
                            }
                        finally{
                            if(INSPECT){log('BUG.END (on fail) finally');}
                            function finish(){
                                finish=undefined;
                                if(INSPECT){log('BUG.END finish (on fail)');}
                                setTimeout(function(BUG){
                                    var zip;
                                    if(BUG.OPTS.dir){
                                        zip=__dirname+'/../'+BUG.OPTS.dir+'BUGS/'+(BUG.FILENAME.replace(BUG.OPTS.dir,'').replace('.json','.zip'));
                                        }
                                    else{
                                        var name=BUG.FILENAME.split('/');
                                        name=name[name.length-1];
                                        zip=__dirname+'/../SETTINGS/BUGS/'+(name.replace('.json','.zip'));
                                        name=undefined;
                                        }
                                    global.L.clean(function(){
                                        G.shell.exec(' cd '+G.log_location+'; zip -r '+zip+' *');
                                        log(' cd '+G.log_location+'; zip -r '+zip+' *');
                                        log(BUG,zip+' created.');
                                        });
                                    },0,BUG);
                                if(BUG.RECOVER_ERROR){
                                    BUG.RECOVER_ERROR=BUG.RECOVER_ERROR.concat([
                                        'NOTE: look at BEFORE and RESULT to see what was changed and try to manually fix'
                                    ,   'NOTE: other changes may have happened since this error so you cannot simply replace the whole object from BEFORE!'
                                        ]);
                                    log('BUG REVERT FAILED (full report in: '+BUG.FILENAME+')');
                                    fs.writeFile(__dirname+'/../SETTINGS/BUGS/'+BUG.FILENAME,G.SAFE.stringify(BUG,undefined,'\t'),function(){
                                        before_cb(BUG);
                                        });
                                    }
                                else{//write file for dev to pick up
                                    BUG.RECOVER_ERROR='NO ERROR (SUCCESSFULLY REVERSED)';
                                    log('BUG REVERT SUCCESS (full report in: '+BUG.FILENAME+')');
                                    fs.writeFile(__dirname+'/../SETTINGS/BUGS/'+BUG.FILENAME,G.SAFE.stringify(BUG,undefined,'\t'),function(){
                                        before_cb(BUG);
                                        });
                                    }
                                }//finish
                            if(INSPECT){log('BUG.END update hist? (on fail)');}
                            if(BUG.ARGUMENTS.remove_from_history_on_fail){
                                G.shell.exec(BUG.ARGUMENTS.remove_from_history_on_fail);
                                }
                            if(BUG.ARGUMENTS.remove_from_sent_on_fail){
                                G.shell.exec(BUG.ARGUMENTS.remove_from_sent_on_fail);
                                }
                            finish();
                            }
                        }
                    else{//success
                        (function ___evs(i){
                            if(BUG.EVENTS[i]){
                                G.EVENT({NET:'live'},BUG.EVENTS[i]);
                                setTimeout(___evs,0,i+1);
                                }
                            else{//end
                                ___evs=undefined;
                                before_cb(BUG);
                                }
                            })(0);
                        }
                    }
                }
            }
        }
    };
fs.exists(__dirname+'/../history',function(bool){GUB.HAS_HISTORY_FOLDER=bool;});
