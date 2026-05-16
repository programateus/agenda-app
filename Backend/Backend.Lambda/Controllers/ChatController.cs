using Backend.Application.UseCases.Chats.CreateChat;
using Backend.Application.UseCases.Chats.CreateChatMessage;
using Backend.Application.UseCases.Chats.ListChatMessages;
using Backend.Application.UseCases.Chats.ListChats;
using Backend.Lambda.DTOs;
using Backend.Lambda.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Lambda.Controllers;

[ApiController]
[Route("api/chats")]
public class ChatController : ControllerBase
{
    private readonly ISender _sender;

    public ChatController(ISender sender)
    {
        _sender = sender;
    }

    [Authorize]
    [HttpPost]
    [EndpointSummary("Create Chat")]
    [EndpointDescription("Create Chat")]
    public async Task<IActionResult> Create(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId() ?? throw new UnauthorizedAccessException();
        var command = new CreateChatCommand(userId);
        var result = await _sender.Send(command, cancellationToken);
        return result.ToActionResult(this);
    }

    [Authorize]
    [HttpGet]
    [EndpointSummary("List Chats")]
    [EndpointDescription("List Chats")]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId() ?? throw new UnauthorizedAccessException();
        var command = new ListChatsCommand(userId);
        var result = await _sender.Send(command, cancellationToken);
        return result.ToActionResult(this);
    }

    [Authorize]
    [HttpPost]
    [Route("{chatId:guid}/messages")]
    [EndpointSummary("Create Chat Message")]
    [EndpointDescription("Create Chat Message")]
    public async Task<IActionResult> CreateMessage(
        CreateChatMessageDTO request,
        Guid chatId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId() ?? throw new UnauthorizedAccessException();
        var command = new CreateChatMessageCommand(chatId, userId, request.Content);
        var result = await _sender.Send(command, cancellationToken);
        return result.ToActionResult(this);
    }

    [Authorize]
    [HttpGet]
    [Route("{chatId:guid}/messages")]
    [EndpointSummary("List Chat Messages")]
    [EndpointDescription("List Chat Messages")]
    public async Task<IActionResult> ListMessages(Guid chatId, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId() ?? throw new UnauthorizedAccessException();
        var command = new ListChatMessagesCommand(chatId, userId);
        var result = await _sender.Send(command, cancellationToken);
        return result.ToActionResult(this);
    }
}
