{
    let view = {
        el: '.right',
        template: `
            <ul class="list-main"></ul>  
        `,
        init(){
            this.$el = $(this.el)
        },
        render(data){
            this.$el.find('.list').html(this.template)
            let {playlists} = data
            playlists.map(playlist=>{
                let {id, name, summary, cover} = playlist
                let $li = $(`
                <li>
                    ${name}
                    <div class="edit">
                        <button class="edit-playlist">编辑专辑</button>
                        <button class="edit-songs">编辑歌曲</button>
                        <button class="delete-playlist">删除专辑</button>
                    </div>
                </li>`).attr('data-playlist-id',id)
                this.$el.find('ul').append($li)
            })   
        }
    }
    let model = {
        data: {
            playlists: []
        },
        find(){
            var query = new AV.Query('Playlist')
            return query.find().then((playlists)=>{
                this.data.playlists = playlists.map((playlist)=>{
                    return {id:playlist.id,...playlist.attributes}
                })
                return this.data
            }) 
        }
    }
    let controller = {
        $data: null,
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.$data = this.model.data
            this.model.find().then((data)=>{
                this.view.render(data)
            })
            this.bindEvent()
            this.bindEventHub()
        },
        bindEvent(){
            this.clickEvent('.edit-playlist',(i,data)=>{
                window.eventHub.emit('select',JSON.parse(JSON.stringify(data)))
            },()=>{
                window.eventHub.emit('edit')
            })
            this.clickEvent('.delete-playlist',(index,data)=>{
                let {id} = data
                var playlist = AV.Object.createWithoutData('Playlist', id)
                playlist.destroy().then(()=>{
                    this.$data.playlists.splice(index,1)
                    this.view.render(this.$data)
                })    
            })
            this.clickEvent('.edit-songs',(index,data)=>{
                let {id} = data
                window.location = `admin-addplaylist.html?id=${id}`
            })
        },
        clickEvent(className,fn,fn1=()=>{}){
            this.view.$el.on('click',className,(e)=>{
                let id = $(e.currentTarget).closest('li').attr('data-playlist-id')
                let playlists = this.$data.playlists
                for(let i =0;i<playlists.length;i++){
                    if(playlists[i].id === id){
                        fn(i,playlists[i])
                        break
                    }
                }
                fn1()
            })
        },
        bindEventHub(){
            window.eventHub.on('create',(playlist)=>{
                this.$data.playlists.push(playlist)
                this.view.render(this.$data)
            })
            window.eventHub.on('updata',(playlist)=>{
                let playlists = this.$data.playlists
                for(let i = 0;i<playlists.length;i++){
                    if(playlists[i].id === playlist.id){
                        Object.assign(playlists[i],playlist)
                        break
                    }
                }
                this.view.render(this.$data)
            })
        }
    }
    controller.init(view, model)
}