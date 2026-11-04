# Lista de confirmações de presença

O convite registra cada convidado confirmado em uma planilha do Google Sheets e envia a Sarah um e-mail com os nomes daquela confirmação e o link para a lista completa. Cada pessoa fica em uma linha, com data e hora, identificador do grupo e status **Confirmado**. O formulário do convite não abre o WhatsApp.

## Configuração única na conta Google

1. Acesse [script.google.com](https://script.google.com/) com a conta que deve ser proprietária da lista e crie um projeto.
2. Copie o conteúdo de `google-apps-script/Code.gs` para o arquivo `Code.gs` do projeto. O destinatário de teste já está configurado como `nicollijdias@gmail.com`; depois do teste, troque `SARAH_EMAIL` pelo e-mail da Sarah.
3. No editor, selecione `setup` e clique em **Executar**. Autorize acesso ao Sheets e envio de e-mail. O registro de execução mostra o link da planilha criada.
4. Compartilhe a planilha com Sarah como editora, para que ela possa acompanhar e marcar os nomes.
5. No Apps Script, escolha **Implantar → Nova implantação → App da Web**. Defina **Executar como: Eu** e acesso para **Qualquer pessoa**; conclua e copie o URL do app da web.
6. Em `Abertura.dc.html`, substitua a string vazia de `RSVP_SHEETS_ENDPOINT` pelo URL copiado.

Depois disso, cada confirmação enviada pelo convite será acrescentada à planilha e Sarah receberá um e-mail de aviso com os nomes e o link para conferir a lista atualizada. Como o convite é um site estático, a configuração do Web App é necessária para salvar os registros e enviar os avisos.
