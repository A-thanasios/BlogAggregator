import {XMLParser} from "fast-xml-parser";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed>
{
        const response = await fetch(feedURL,
            {
                method: "GET",
                mode: "cors",
                headers:
                    {
                        'User-Agent': 'gator'
                    }
            });

        const dataStr: string = await response.text();

        const parser = new XMLParser();
        const dataObj = parser.parse(dataStr) as any;

        let channel;

        if (dataObj.rss.channel) channel = dataObj.rss.channel;
        else throw new Error("Invalid RSS feed. Object does not contain channel.");

        let title: string;
        let link: string;
        let description: string;

        if (channel.title && channel.link && channel.description) {
            title = channel.title;
            link = channel.link;
            description = channel.description;
        } else throw new Error("Invalid RSS feed. Channel does not contain title, link or description.");

        const rssItems: RSSItem[] = [];

        if (channel.item && Array.isArray(channel.item))
        {
            for (const item of channel.item)
            {
                if (item.title && item.link && item.description && item.pubDate)
                    rssItems.push(item);
            }
        }
        else if(channel.item)
        {
            rssItems.push(channel.item);
        } else throw new Error("Invalid RSS feed. Channel does not contain item in array format or is invalid.");

        return { channel:  {
                            title,
                            link,
                            description,
                            item: rssItems
                            }
        };
}