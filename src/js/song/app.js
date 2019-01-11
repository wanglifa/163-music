{
    let view = {
        el: '.page',
        template: `
            
        `,
        init(){
            this.$el = $(this.el)
        },
        render(data){
            let {song,status} = data
            this.$el.find('.page-container').css('background-image',`url(${song.cover})`)
            this.$el.find('.cover').attr('src',song.cover)
            //重新渲染的时候如果audio里的src是#就让它等于当前的song.url否则，就不去重新渲染
            if(this.$el.find('audio').attr('src') !== song.url){
                this.$el.find('audio').attr('src',song.url)
            }
            if(status === 'playing'){
                this.$el.find('.disc-container').addClass('playing')
            }else{
                this.$el.find('.disc-container').removeClass('playing')
            }
        },
        play(){
            console.log(1)
            this.$el.find('audio')[0].play()
        },
        pause(){
            this.$el.find('audio')[0].pause()
        },
        
        
    }
    let model = {
        data: {
            song: {
                id: '',
                name: '',
                singer: '',
                url: '',
                cover: ''
            },
            status: 'pause'
        },
        getSong(id){
            var song = new AV.Query('Song')
            return song.get(id).then(data=>{
                Object.assign(this.data.song,data.attributes)
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
            this.view.$el.on('click','.icon-play',()=>{
                this.model.data.status = 'playing'
                this.view.render(this.model.data)
                this.view.play()
            })
            this.view.$el.on('click','.icon-pause',()=>{
                this.model.data.status = 'pause'
                this.view.render(this.model.data)
                this.view.pause()
            })
        }
    }
    controller.init(view, model)
}