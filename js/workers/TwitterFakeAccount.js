class TwitterFakeAccount
{

    constructor()
    {
        this.intMaxEditDistance = 4;
        this.arrAllTwitterUsernames = [];
        this.objWhitelistedHandles = {
            295218901: "VitalikButerin",
            2312333412: "ethereumproject",
            4831010888: "myetherwallet",
            2309637680: "BittrexExchange",
            1399148563: "krakenfx",
            877807935493033984: "binance_2017",
            894231710065446912: "Tronfoundation",
            33962758: "gavofyork",
            139487079: "VladZamfir",
            63064338: "koeppelmann",
            2491775609: "mandeleil",
            143053926: "gavinandresen",
            1469101279: "aantonop",
            774689518767181828: "ethstatus",
            34592834: "nickdjohnson",
            14379660: "brian_armstrong",
            3331352283: "ConsenSysAndrew",
            2207129125: "Cointelegraph",
            1333467482: "coindesk",
            841424245938769920: "AttentionToken",
            2288889440: "Poloniex",
            907209378331336705: "raiden_network",
            2561715571: "ShapeShift_io",
            10157: "avsa",
            861463172296974336: "joinindorse",
            14338147: "SatoshiLite",
            3313312856: "etherscan",
            3278906401: "metamask_io",
            574032254: "coinbase",
            19748227: "mewtant_",
            878924739812761600: "QuikNode"
        };
        this.arrViewBlacklistedUserIds = [];
        this.arrViewWhitelistedUserIds = [];
        this.intTweetCount = 0;
    }

    /**
     * Checks to see if a userid/username is an "imposter" of a whitelisted one.
     *
     * @param   int         intUserId           The twitter userid
     * @param   string      strUsername         The twitter username
     * @return  object                          IE: {"result":true,"similar_to":"xxxx"} or {"result":false}
     */
    isImposter(intUserId, strUsername)
    {

        //idk why sometimes it's null...
        if(intUserId === null) {
            return {
                "result":false
            };
        }

        //Check the username against the whitelist with levenshtein edit distance
        for(var intKey in this.objWhitelistedHandles) {
            //console.log(strUsername + " checking against: "+ this.objWhitelistedHandles[intKey]);
            var intHolisticMetric = this.levenshtein(strUsername, this.objWhitelistedHandles[intKey]);
            if (intHolisticMetric <= this.intMaxEditDistance) {
                //Add it to the array so we don't have to do Levenshtein again
                this.arrViewBlacklistedUserIds[intUserId] = {
                    "holistic": intHolisticMetric,
                    "similar_to": this.objWhitelistedHandles[intKey]
                };
                return {
                    "result":true,
                    "similar_to":this.objWhitelistedHandles[intKey]
                };
            }
        }

        //Add it to the array so we don't have to do any checks again
        this.arrViewWhitelistedUserIds.push(intUserId);
        return {
            "result":false
        };

        //Userid is whitelisted!
        if ((intUserId in this.objWhitelistedHandles)) {
            //Add it to the array so we don't have to do any checks again
            this.arrViewWhitelistedUserIds.push(intUserId);
            return {
                "result":false
            };
        }

        //Userid has already been checked.
        if(this.arrViewWhitelistedUserIds.length > 0) {
            if(this.arrViewWhitelistedUserIds.indexOf(intUserId) !== -1) {
                //console.log(intUserId +" has already been checked.");
                return {
                    "result":false
                };
            }
        }

        //The userid has already been tested a positive match
        if(this.arrViewBlacklistedUserIds.length > 0) {
            if (this.arrViewBlacklistedUserIds.indexOf(intUserId) !== -1) {
                return {
                    "result": true,
                    "similar_to": this.arrViewBlacklistedUserIds[intUserId].similar_to
                };
            }
        }

        //Check the username against the whitelist with levenshtein edit distance
        for(var intKey in this.objWhitelistedHandles) {
            //console.log(strUsername + " checking against: "+ this.objWhitelistedHandles[intKey]);
            var intHolisticMetric = this.levenshtein(strUsername, this.objWhitelistedHandles[intKey]);
            if (intHolisticMetric <= this.intMaxEditDistance) {
                //Add it to the array so we don't have to do Levenshtein again
                this.arrViewBlacklistedUserIds[intUserId] = {
                    "holistic": intHolisticMetric,
                    "similar_to": this.objWhitelistedHandles[intKey]
                };
                return {
                    "result":true,
                    "similar_to":this.objWhitelistedHandles[intKey]
                };
            }
        }

        //Add it to the array so we don't have to do any checks again
        this.arrViewWhitelistedUserIds.push(intUserId);
        return {
            "result":false
        };
    }

    /**
     * Performs a Levenshtein edit distance between 2 strings.
     *
     * @param   string      a       The string to compare.
     * @param   string      b       The base string to use.
     *
     * @return  int                 The amount of edits between the 2 strings.
     */
    levenshtein(a, b)
    {
        if(a.length == 0) return b.length;
        if(b.length == 0) return a.length;

        // swap to save some memory O(min(a,b)) instead of O(a)
        if(a.length > b.length) {
            var tmp = a;
            a = b;
            b = tmp;
        }

        var row = [];
        // init the row
        for(var i = 0; i <= a.length; i++){
            row[i] = i;
        }

        // fill in the rest
        for(var i = 1; i <= b.length; i++){
            var prev = i;
            for(var j = 1; j <= a.length; j++){
                var val;
                if(b.charAt(i-1) == a.charAt(j-1)){
                    val = row[j-1]; // match
                } else {
                    val = Math.min(row[j-1] + 1, // substitution
                        prev + 1,     // insertion
                        row[j] + 1);  // deletion
                }
                row[j - 1] = prev;
                prev = val;
            }
            row[a.length] = prev;
        }

        return row[a.length];
    }
}

self.onmessage = function(objData) {
    var objTwitterFakeAccount = new TwitterFakeAccount();
    var arrTweetData = JSON.parse(objData.data);

    for(var intCounter=0; intCounter<arrTweetData.length; intCounter++) {
        var objTweetData = arrTweetData[intCounter];
        var objImposter = objTwitterFakeAccount.isImposter(objTweetData.userId, objTweetData.name);
        if(objImposter.result) {
            objTweetData.is_imposter = true;
            objTweetData.similar_to = objImposter.similar_to;
        } else {
            objTweetData.is_imposter = false;
        }
        arrTweetData[intCounter] = objTweetData;
    }

    postMessage(JSON.stringify(arrTweetData));

};