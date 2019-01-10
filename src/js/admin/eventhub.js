window.eventHub= {
    events: {
        //'updata': [fn]
    },
    emit(eventName, data){//发布
        for(let key in this.events){
            if(key === eventName){
                //遍历this.events[key]这个数组，调用里面所有的函数给它们传入一个data
                this.events[key].map(fn=>{
                    fn.call(undefined,data)
                })
            }
        }
    },
    on(eventName, fn){//订阅
        if(!this.events[eventName]){
            this.events[eventName] = []
        }
        this.events[eventName].push(fn)
    }
}