{
    let view = {
        el: '.playlists',
        init(){
            this.$el = $(this.el)
        },
        render(data){
            let {playlists} = data
            playlists.map(playlist=>{
                let {cover,id,name,summary} = playlist
                $li = $(`<li>
                        <a href="./playlist.html?id=${id}">
                            <div class="cover">
                                <img src="${cover}">
                            </div>
                            <p>${summary}</p>
                        </a>
                        </li>`)
                 this.$el.find('.songs').append($li)  
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
                    return  {id:playlist.id,...playlist.attributes}
                })
                return this.data
            })
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.model.find().then((data)=>{
                this.view.$el.find('.loading').remove()
                this.view.render(data)
            })
        }
    }
    controller.init(view, model)
}