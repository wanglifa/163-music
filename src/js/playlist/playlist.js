{
    let view = {
        el: '.playlist',
        template: `
            <ul></ul>
        `,
        init(){
            this.$el = $(this.el)
            this.$top = this.$el.find('.top')
        },
        playlistInit(data){
            let {playlist} = data
            let {name,summary,cover} = playlist
            let $img = $(`<img>`).attr('src',cover)
            let $span = $(`<span class="slogn">歌单</span>`)
            this.$top.find('.bg').css('background-image',`url(${cover})`)
            let key = [$img,$span]
            key.map(list=>{
                this.$top.find('.left').append(list)
            })
            let $p = $(`
            <p>${name}</p>
            `)
            this.$top.find('.right').append($p)
            let $summary = $(`<p>${summary}</p>`)
            this.$el.find('.middle').append($summary)
            this.$el.find('.comment .row img').attr('src',cover)
        },
        allSongsInit(data){
            let {songs} = data
            songs.map(song=>{
                let $li = $(`
                <li>
                  <h3>${song.name}</h3>
                  <p>
                    <svg class="icon icon-sq">
                      <use xlink:href="#icon-sq"></use>
                    </svg>
                    ${song.singer}
                  </p>
                  <a class="playButton" href="./song.html?id=${song.id}">
                    <svg class="icon icon-play">
                      <use xlink:href="#icon-play"></use>
                    </svg>
                  </a>
                </li>
                `)
                this.$el.find('.list').append($li)
            })
        },
        render(data){
            this.playlistInit(data)
            this.allSongsInit(data)
        },
        renderComment(data=[]){
            this.$el.find('.comment-list').html(this.template)
            data.map((context,index)=>{
                let $li = $(`<li><strong>游客${data.length-index}:</strong><span>${context}</span></li>`)
                this.$el.find('.comment-list > ul').append($li)
            })
        }
    }
    let model = {
        $playlist: null,
        data: {
            playlist: {
                id: '',
                name: '',
                summary: '',
                cover: ''
            },
            songs: [],
            comments: []
        },
        getPlaylist(id){
            var query = new AV.Query('Playlist');
            return query.get(id).then((playlist)=>{
                Object.assign(this.data.playlist,playlist.attributes)
                return this.data 
            })
        },
        getplaylistId(){
            let search = window.location.search.substring(1)
            let key = search.split('=')
            let id = key[1]
            this.data.playlist.id = id
        },
        getAllSongs(id){
            let query =this.getRelatedClassName('Song',id)
            return query.find().then((songs=>{
                this.data.songs = songs.map(song=>{
                    return {id:song.id,...song.attributes}
                })
                return this.data.songs
            }))
        },
        getComment(id){
            let query = this.getRelatedClassName('Comment',id)
            return query.find().then(comments=>{
                this.data.comments = comments.map(comment=>{
                    let {context} = comment.attributes
                    return context
                })
                return this.data.comments
            })
        },
        getRelatedClassName(className,id){
            this.$playlist = AV.Object.createWithoutData('Playlist', id)
            var query = new AV.Query(className)
            query.equalTo('dependent', this.$playlist)
            return query
        },
        getPlaylistAndSongs(id){
            let promise1 = this.getPlaylist(id)
            let promise2 = this.getAllSongs(id)
            return Promise.all([promise1,promise2])
        },
        createComment(context){
            var comment = new AV.Object('Comment')
            let {id} = this.data.playlist
            comment.set('dependent',this.$playlist)
            comment.set('context',context)
            return comment.save()
        }
    }
    let controller = {
        id: '',
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.model.getplaylistId()
            this.id = this.model.data.playlist.id
            this.model.getComment(this.id).then((context)=>{
                this.view.renderComment(context)
            })
            this.asycModel()
            this.bindEvent()
        },
        asycModel(){
            this.model.getPlaylistAndSongs(this.id).then((data)=>{
                Object.assign(this.model.data,data[0])
                this.view.render(this.model.data)
            })
        },
        bindEvent(){
            this.view.$el.on('submit','.comment > form',(e)=>{
                e.preventDefault()
                let comments = this.model.data.comments
                let comment = this.view.$el.find('[name=comment]').val()
                this.model.createComment(comment).then((data)=>{
                    let {context} = data.attributes
                    comments.unshift(context)
                    this.view.renderComment(comments)
                })
            })
        },
        

    }
    controller.init(view, model)
}