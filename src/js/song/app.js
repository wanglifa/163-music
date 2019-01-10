{
    let view = {
        el: '#app',
        template: `
            <audio src="__url__"></audio>
            <div>
                <button class="play">播放</button>
                <button class="pause">暂停</button>
            </div>
        `,
        init(){
            this.$el = $(this.el)
        },
        render(data){
            let audio =this.template.replace('__url__',data.url)
            this.$el.html(audio)
        },
        play(){
            this.$el.find('audio')[0].play()
        },
        pause(){
            this.$el.find('audio')[0].pause()
        }
    }
    let model = {
        data: {
            id: '',
            name: '',
            singer: '',
            url: ''
        },
        getSong(id){
            var song = new AV.Query('Song')
            return song.get(id).then(data=>{
                Object.assign(this.data,data.attributes)
                return this.data
            })
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.getId()
            this.model.getSong(this.model.data.id)
                .then(()=>{
                    this.view.render(this.model.data)
                })
            this.bindEvent()    
        },
        getId(){
            let search = window.location.search
            let id = ''
            if(search){
                var idOne = search.substring(1).split('&')
                idOne.map(list=>{
                    var keyValue = list.split('=')
                    var idKey = keyValue[0]
                    id = keyValue[1]
                })
            }
            this.model.data.id = id
        },
        bindEvent(){
            this.view.$el.on('click','.play',()=>{
                console.log(1)
                this.view.play()
            })
            this.view.$el.on('click','.pause',()=>{
                this.view.pause()
            })
        }
    }
    controller.init(view, model)
}