(function() {
    
    var filename = 'https://tympanus.net/codrops/adpacks/demoad.css?' + new Date().getTime();
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    document.getElementsByTagName("head")[0].appendChild(fileref);
    /*
    var cdaLink = 'https://www.elegantthemes.com/affiliates/idevaffiliate.php?id=17972_5_1_16';
    var cdaImg = 'https://tympanus.net/codrops/wp-content/banners/Divi_Carbon.jpg';
    var cdaImgAlt = 'Divi';
    var cdaText = "From our sponsor: Divi is more than just a WordPress theme, it's a completely new website building platform. Try it.";
    */
    
    var cdaLink = 'https://ad.doubleclick.net/ddm/clk/459321073;263127775;j';
    var cdaImg = 'https://tympanus.net/codrops/wp-content/banners/mailchimp_demo.png';
    var cdaImgAlt = 'Mailchimp';
    var cdaText = "Need a hand with your marketing? No problem. Now you can access 200+ pre-built integrations for your app with Mailchimp.";
    

    /*
    var cdaLink = 'https://bit.ly/2Jen9Md';
    var cdaImg = 'https://tympanus.net/codrops/wp-content/banners/amelia.png';
    var cdaImgAlt = 'Amelia';
    var cdaText = "Build time-saving appointment and event booking websites easily with the Amelia WordPress plugin.";
    */

    var cda = document.createElement('div');
    cda.id = 'cdawrap';
    cda.style.display = 'none';
    cda.innerHTML = '<a href="'+cdaLink+'" class="carbon-img" target="_blank" rel="sponsored"><img src="'+cdaImg+'" alt="'+cdaImgAlt+'" border="0" height="100" width="130"></a><a href="'+cdaLink+'" class="carbon-text" target="_blank" rel="noopener">'+cdaText+'</a><div class="cda-footer"><a class="carbon-poweredby" href="https://tympanus.net/codrops/advertise/" target="_blank" rel="noopener">Become a sponsor</a><span class="cda-remove" id="cda-remove">Close</span></div>';
    document.getElementsByTagName('body')[0].appendChild(cda);

    setTimeout(function() {
        cda.style.display = 'block';
    }, 1000);

    document.getElementById('cda-remove').addEventListener('click', function(e) {
        cda.style.display = 'none';
        e.preventDefault();
    });
    
})();