# Instructions

We are developing a web application called **Marmalade**, which helps to visualize how a given passage of text will be _seen_ by a tokenizer corresponding to a selected text embedding model.

## Product Focus

The targeted users of this application are data engineers, machine learning researchers, developers and product owners who are interested in understanding how text is tokenized and embedded, specifically with a focus on search and retrieval use cases.

We aim for this app to be similar to web-based developer tools like [regex101](https://regex101.com), [carbon for code snippets](https://carbon.now.sh), and many more. We want users to be able to open the site, paste their text, and get results instantly. We will provide numerous ways to configure the tokenizer, context size, window size, and other parameters. But, the pasted text and resulting highlighting should be the primary visual content. We will use hover effects and closeable side panels to display additional information based on user clicks, hovers and selections.

## Design Goals

The name **Marmalade** is a reference to the character Paddington Bear, who is known for his love of marmalade and its sweet, stick, "chunks". This app is focused on highlighting how text passages are _chunked_ given a selected tokenizer to be used for embeddings and retrieval. Add to this that the word "padding" is also in the character's name, and it becomes a fun cultural reference that hopefully others will recognize.

As a result, we are using a color palette of orange (marmalade), blue (color Paddington's coat), and light brown (color of Paddington's fur). We also want the design to be incredibly simple, intuitive and playful. It should look and feel like an app kids could use.

We can also play into the classic english style of Paddington Bear illustrations.

## Technical Details

The following are a few key technical details about Marmalade:

* Application developed with Svelte Svelte-kit
* Application deployed on Railway
* Application uses `transformers.js` library for client-side tokenization


## Collaboration and Co-Development

First and foremost, development of this application is an opportuntity for me to develop my skills in web application development, especially using JavaScript, Svelte, and related technologies. My background and strength is in Machine Learning, Data Engineering and Backend Development. The idea of creating a chunk visualizer based around language model tokenizers is a perfect intersection of these two things.

With that said, please respect my desire to learn and grow. I am looking to your for help in that regard, and I know you are perfect for this role. There may be times that I choose to delegate some work to you entirely, either due to time constraints or a recognition that the complexity exceeds my ability to understand at that time. Generally, however, please defer to teaching me, and showing by example.
