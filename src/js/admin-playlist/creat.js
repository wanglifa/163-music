{
    let view = {
        el: '.left',
        init(){
            this.$el = $(this.el)
        },
        render(data){
            this.getContent(data)
        },
        getContent(data){
            let name = ['name','cover','summary','id']
            name.map(name=>{
                this.$el.find(`[name=${name}]`).val(data[name])
            })
        }
    }
    let model = {
        data: {
            name: '',
            cover: '',
            summary: '',
            id: ''
        },
        createPlaylist(data){
            var playlist = new AV.Object('Playlist')
            for(let key in data){
                if(key !== 'id'){
                    playlist.set(key,data[key])
                }
            }
            return playlist.save()
        },
        updata(data){
            var playlist = AV.Object.createWithoutData('Playlist', this.data.id)
            // 修改属性
            for(let key in data){
                playlist.set(key,data[key])
            }
            playlist.set('id',this.data.id)
            // 保存到云端
            return playlist.save()
        }
    }
    let controller = {
        $data: {},
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.bindEvent()
            this.bindEventHub()
        },
        getData(){
            let name = ['name','cover','summary','id']
            this.$data
            name.map(name=>{
                this.$data[name] = this.view.$el.find(`[name=${name}]`).val()
            })
        },
        create(data){
            this.model.createPlaylist(data).then((playlist)=>{
                let list = {id: playlist.id,...playlist.attributes}
                window.eventHub.emit('create',JSON.parse(JSON.stringify(list)))
                this.model.data = {name: '', cover: '', summary: '', id: ''}
                this.view.render(this.model.data)
            })
        },
        updata(data){
            return this.model.updata(data)
        },
        bindEvent(){
            this.view.$el.on('submit', '.playlistForm',(e)=>{
                e.preventDefault()
                this.getData()
                if(this.model.data.id){
                    this.updata(this.$data).then((data)=>{
                        let list = {id:data.id,...data.attributes}
                        window.eventHub.emit('updata',JSON.parse(JSON.stringify(list)))
                        this.model.data = {name: '', cover: '', summary: '', id: ''}
                        this.view.render(this.model.data)
                        this.view.$el.find('h1').text('创建歌单')
                    })
                }else {
                    this.create(this.$data)
                }
                // this.getData()
                
                // console.log(1)
            })
        },
        bindEventHub(){
            window.eventHub.on('select',(data)=>{
                this.model.data = data
                this.view.render(this.model.data)
            })
            window.eventHub.on('edit',()=>{
                this.view.$el.find('h1').text('编辑歌单')
            })
        }
    }
    controller.init(view, model)
}